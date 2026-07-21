/**
 * ========================================================================
 * SERVIÇO DE AUTENTICAÇÃO - Lógica de Negócio
 * ========================================================================
 * 
 * Este serviço contém toda a lógica de negócio para autenticação de usuários.
 * É o coração do sistema de segurança da plataforma SEADI.
 * 
 * Funcionalidades:
 * 
 * 1. REGISTRO DE USUÁRIOS
 *    - Valida unicidade do email
 *    - Criptografa senha com bcrypt (10 rounds)
 *    - Cria usuário no banco de dados
 *    - Retorna token JWT imediatamente
 * 
 * 2. LOGIN
 *    - Valida credenciais (email + senha)
 *    - Implementa rate limiting (máx 5 tentativas/15min)
 *    - Registra tentativas de login (sucesso/falha)
 *    - Atualiza último acesso do usuário
 *    - Retorna token JWT
 * 
 * 3. RECUPERAÇÃO DE SENHA
 *    - Gera código de 6 dígitos
 *    - Envia por email
 *    - Código expira em 30 minutos
 *    - Cooldown de 5 minutos entre solicitações
 * 
 * 4. REDEFINIÇÃO DE SENHA
 *    - Valida código de recuperação
 *    - Atualiza senha com hash bcrypt
 *    - Marca código como utilizado
 * 
 * Segurança:
 * - Senhas nunca são armazenadas em texto plano
 * - Tokens JWT com expiração configurável
 * - Rate limiting previne ataques de força bruta
 * - Validações robustas de entrada
 * ========================================================================
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ActivityService } from '../progress/activity.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

/**
 * Serviço de autenticação do sistema SEADI.
 * 
 * Este serviço é responsável por:
 * - Gerenciar o ciclo de vida de autenticação dos usuários
 * - Implementar medidas de segurança (rate limiting, hashing de senhas)
 * - Integrar com o sistema de email para recuperação de senha
 * - Registrar atividades de login para auditoria
 */
@Injectable()
export class AuthService {
  /**
   * Injeção de dependências do AuthService.
   * 
   * @param prisma - Serviço de acesso ao banco de dados
   * @param jwtService - Serviço de geração e validação de tokens JWT
   * @param mailService - Serviço de envio de emails
   * @param activity - Serviço de registro de atividades
   */
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private activity: ActivityService,
  ) {}

  /**
   * Registra um novo usuário no sistema.
   * 
   * Fluxo:
   * 1. Normaliza o email (minúsculas, sem espaços)
   * 2. Verifica se o email já está cadastrado
   * 3. Criptografa a senha com bcrypt
   * 4. Cria o usuário no banco de dados
   * 5. Gera token JWT
   * 6. Retorna dados do usuário e token
   * 
   * @param dto - Dados do registro (name, email, password, phone?, birthDate?)
   * @returns Objeto com { user, token }
   * 
   * @throws ConflictException - Se o email já estiver cadastrado
   * @throws BadRequestException - Se os dados forem inválidos
   */
  async register(dto: RegisterDto) {
    // Normaliza o email para minúsculas e remove espaços
    // Isso garante que "User@Exemplo.COM" e "user@exemplo.com" sejam o mesmo email
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Verifica se o email já existe no banco de dados
    const existing = await this.prisma.usuario.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Criptografa a senha com bcrypt
    // O '10' indica o número de rounds de hashing (custo computacional)
    // Quanto maior, mais seguro, mas mais lento
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Cria o usuário no banco de dados
    // O select especifica quais campos retornar (nunca senha!)
    const user = await this.prisma.usuario.create({
      data: {
        nome: dto.name,
        email: normalizedEmail,
        senha: hashedPassword,
        // Operador spread condicional: inclui o campo apenas se existir
        ...(dto.phone && { telefone: dto.phone }),
        ...(dto.birthDate && { dataNascimento: new Date(dto.birthDate) }),
      },
      select: { id: true, nome: true, email: true, criadoEm: true },
    });

    // Gera o token JWT com o ID e email do usuário
    // O token é assinado com o secret configurado no módulo JWT
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { user, token };
  }

  /**
   * Realiza o login do usuário.
   * 
   * Fluxo:
   * 1. Normaliza o email
   * 2. Busca o usuário no banco
   * 3. Verifica rate limiting (máx 5 tentativas/15min)
   * 4. Compara senha com bcrypt
   * 5. Registra tentativa de login
   * 6. Se sucesso: gera token e atualiza último acesso
   * 7. Retorna dados do usuário e token
   * 
   * @param dto - Dados do login (email, password)
   * @returns Objeto com { user, token }
   * 
   * @throws UnauthorizedException - Credenciais inválidas ou muitas tentativas
   */
  async login(dto: LoginDto) {
    // Normaliza o email
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Busca o usuário pelo email
    const user = await this.prisma.usuario.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    /**
     * RATE LIMITING - Prevenção de ataques de força bruta
     * 
     * Configurações via variáveis de ambiente:
     * - LOGIN_WINDOW_SECONDS: Janela de tempo para contagem (padrão: 900 = 15 min)
     * - MAX_LOGIN_ATTEMPTS: Máximo de tentativas falhas (padrão: 5)
     * 
     * O sistema conta tentativas falhas recentes e bloqueia se exceder o limite
     */
    const loginWindow = parseInt(process.env.LOGIN_WINDOW_SECONDS || '900', 10);
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);

    // Conta tentativas falhas na janela de tempo
    const recentAttempts = await this.prisma.tentativaLogin.count({
      where: {
        usuarioId: user.id,
        sucesso: false,
        momento: {
          gte: new Date(Date.now() - loginWindow * 1000),
        },
      },
    });

    if (recentAttempts >= maxAttempts) {
      throw new UnauthorizedException('Too many attempts. Try again later.');
    }

    // Compara a senha fornecida com o hash armazenado
    // bcrypt.compare é resistente a ataques de timing
    const passwordValid = await bcrypt.compare(dto.password, user.senha);

    // Registra a tentativa de login (sucesso ou falha)
    // Isso é importante para auditoria e rate limiting
    await this.prisma.tentativaLogin.create({
      data: { usuarioId: user.id, sucesso: passwordValid },
    });

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Gera o token JWT
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    // Atualiza o último acesso do usuário
    // Útil para estatísticas e auditoria
    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() },
    });

    // Registra a atividade de login
    // Isso permite rastrear quando o usuário fez login
    await this.activity.log(user.id, 'login', 'Fez login na plataforma');

    return {
      user: { id: user.id, nome: user.nome, email: user.email },
      token,
    };
  }

  /**
   * Solicita código de recuperação de senha.
   * 
   * Fluxo:
   * 1. Normaliza o email
   * 2. Verifica se o usuário existe
   * 3. Verifica cooldown (5 minutos entre solicitações)
   * 4. Gera código de 6 dígitos
   * 5. Armazena no banco com expiração de 30 minutos
   * 6. Envia código por email
   * 7. Retorna mensagem genérica (por segurança)
   * 
   * @param dto - Dados da solicitação (email)
     * @returns Mensagem de confirmação
     * 
     * @throws BadRequestException - Se cooldown não expirou
     */
  async forgotPassword(dto: ForgotPasswordDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Verifica se o usuário existe
    const user = await this.prisma.usuario.findUnique({
      where: { email: normalizedEmail },
    });

    // Por segurança, sempre retorna a mesma mensagem
    // Isso previne enumeração de usuários
    if (!user) {
      return { message: 'Recovery code sent to email' };
    }

    /**
     * COOLDOWN - Prevenção de spam de emails
     * 
     * Configuração via variável de ambiente:
     * - FORGOT_PASSWORD_COOLDOWN_SECONDS: Tempo mínimo entre solicitações (padrão: 300 = 5 min)
     */
    const cooldown = parseInt(process.env.FORGOT_PASSWORD_COOLDOWN_SECONDS || '300', 10);
    const recentCode = await this.prisma.redefinicaoSenha.findFirst({
      where: {
        email: normalizedEmail,
        usado: false,
        criadoEm: { gte: new Date(Date.now() - cooldown * 1000) },
      },
    });

    if (recentCode) {
      throw new BadRequestException('Please wait before requesting a new code');
    }

    // Gera código aleatório de 6 dígitos
    // Math.random() não é criptograficamente seguro, mas para códigos de 6 dígitos
    // é aceitável (são temporários e de curta duração)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Armazena o código no banco com expiração de 30 minutos
    await this.prisma.redefinicaoSenha.create({
      data: {
        email: normalizedEmail,
        codigo: code,
        expiraEm: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    // Enia o código por email
    await this.mailService.sendPasswordResetCode(normalizedEmail, code);

    return { message: 'Recovery code sent to email' };
  }

  /**
   * Redefine a senha do usuário com código de recuperação.
   * 
   * Fluxo:
   * 1. Normaliza o email
   * 2. Valida o código (existe, não expirado, não utilizado)
   * 3. Busca o usuário
   * 4. Criptografa a nova senha
   * 5. Atualiza a senha no banco
   * 6. Marca o código como utilizado
   * 7. Retorna mensagem de sucesso
   * 
   * @param dto - Dados da redefinição (email, code, newPassword)
   * @returns Mensagem de sucesso
   * 
   * @throws BadRequestException - Código inválido, expirado ou usuário não encontrado
   */
  async resetPassword(dto: ResetPasswordDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Valida o código de recuperação
    const record = await this.prisma.redefinicaoSenha.findFirst({
      where: {
        email: normalizedEmail,
        codigo: dto.code,
        usado: false,
        expiraEm: { gte: new Date() },
      },
      orderBy: { criadoEm: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired recovery code');
    }

    // Busca o usuário
    const user = await this.prisma.usuario.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Atualiza a senha no banco
    await this.prisma.usuario.update({
      where: { email: normalizedEmail },
      data: { senha: hashedPassword },
    });

    // Marca o código como utilizado (não pode ser reutilizado)
    await this.prisma.redefinicaoSenha.update({
      where: { id: record.id },
      data: { usado: true },
    });

    return { message: 'Password reset successfully' };
  }
}
