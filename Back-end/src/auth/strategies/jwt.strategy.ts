/**
 * ========================================================================
 * ESTRATÉGIA JWT - Validação de Tokens
 * ========================================================================
 * 
 * Esta estratégia implementa a validação de tokens JWT usando o Passport.
 * Ela é chamada automaticamente pelo JwtAuthGuard para cada requisição
 * em rotas protegidas.
 * 
 * Fluxo de validação:
 * 1. Extrai o token do header Authorization (Bearer token)
 * 2. Verifica a assinatura digital (secret key)
 * 3. Verifica se o token não expirou
 * 4. Decodifica o payload (sub, email, iat, exp)
 * 5. Busca o usuário no banco de dados
 * 6. Retorna os dados do usuário (anexado a req.user)
 * 
 * Configurações:
 * - jwtFromRequest: Extrai token do header Authorization
 * - ignoreExpiration: false (rejeita tokens expirados)
 * - secretOrKey: Chave secreta para verificar assinatura
 * 
 * O token deve conter:
 * - sub: ID do usuário
 * - email: Email do usuário
 * - iat: Timestamp de criação (issued at)
 * - exp: Timestamp de expiração (expiration)
 * ========================================================================
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Estratégia de validação JWT.
 * 
 * Extends PassportStrategy(Strategy) do @nestjs/passport.
 * O Passport Strategy é um plugin que implementa um algoritmo
 * específico de autenticação (neste caso, JWT).
 * 
 * O construtor configura:
 * - Como extrair o token da requisição
 * - Onde encontrar a chave secreta
 * - Se deve verificar expiração
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Construtor da estratégia JWT.
   * 
   * @param prisma - Serviço de acesso ao banco para buscar o usuário
   */
  constructor(private prisma: PrismaService) {
    super({
      // Configura como extrair o token da requisição
      // Extrai do header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Não ignora expiração - tokens expirados são rejeitados
      ignoreExpiration: false,
      
      // Chave secreta usada para verificar a assinatura do token
      // Deve ser a mesma usada para assinar o token (JWT_SECRET)
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Valida o payload do token JWT e retorna os dados do usuário.
   * 
   * Este método é chamado automaticamente pelo Passport após
   * decodificar o token com sucesso.
   * 
   * @param payload - Payload decodificado do token JWT
   * @param payload.sub - ID do usuário (subject)
   * @param payload.email - Email do usuário
   * 
   * @returns Objeto com dados do usuário (será anexado a req.user)
   * 
   * @throws UnauthorizedException - Se o usuário não for encontrado no banco
   * 
   * Nota: Este método é chamado APENAS se o token for válido.
   * Se o token for inválido, o Passport já lança uma exceção antes.
   */
  async validate(payload: { sub: number; email: string }) {
    // Busca o usuário no banco de dados
    // Isso garante que o usuário ainda existe e está ativo
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, nome: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Retorna os dados do usuário
    // Este objeto será anexado a req.user em qualquer rota protegida
    return user;
  }
}
