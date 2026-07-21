/**
 * ========================================================================
 * PONTO DE ENTRADA DA APLICAÇÃO - SEADI Backend
 * ========================================================================
 * 
 * Este arquivo é o responsável por inicializar o servidor NestJS.
 * O SEADI é uma plataforma de aprendizagem de inclusão digital do SENAC.
 * 
 * Funcionalidades principais configuradas aqui:
 * - Servidor HTTP com suporte a CORS
 * - Validação global de dados de entrada
 * - Prefixo global '/api' para todas as rotas
 * - Servição de arquivos estáticos (frontend e uploads)
 * - Redirecionamento da raiz para o login
 * 
 * Porta padrão: 5000 (configurável via variável de ambiente PORT)
 * ========================================================================
 */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

/**
 * Função de bootstrap - Inicializa a aplicação NestJS.
 * 
 * Esta função é chamada quando o servidor inicia e é responsável por:
 * 1. Criar a instância da aplicação NestJS
 * 2. Configurar CORS (Cross-Origin Resource Sharing)
 * 3. Aplicar validação global de DTOs
 * 4. Configurar prefixo '/api' para todas as rotas
 * 5. Servir arquivos estáticos do frontend e uploads
 * 6. Iniciar o servidor na porta configurada
 */
async function bootstrap() {
  // Cria a aplicação NestJS usando o módulo raiz (AppModule)
  // NestExpressApplication fornece acesso às APIs do Express para configurações avançadas
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /**
   * Configuração de CORS (Cross-Origin Resource Sharing)
   * Permite que o frontend acesse a API de diferentes domínios/origens
   * Exemplo: http://localhost:5000 pode acessar a API em http://localhost:3000
   * 
   * ALLOWED_ORIGINS: Lista de origens permitidas separadas por vírgula
   * Exemplo: "http://localhost:5000,https://meudominio.com"
   */
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true, // Permite envio de cookies e headers de autenticação
  });

  /**
   * Validação Global de Dados de Entrada
   * Aplica validação automática em todos os DTOs (Data Transfer Objects)
   * 
   * Configurações:
   * - whitelist: Remove propriedades não declaradas no DTO
   * - forbidNonWhitelisted: Lança erro se houver propriedades não declaradas
   * - transform: Converte automaticamente os tipos de dados
   * 
   * Isso garante que todos os dados recebidos estejam no formato correto
   * e protege contra ataques de injeção de dados extras
   */
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  /**
   * Prefixo Global de Rotas
   * Todas as rotas começarão com '/api'
   * Exemplo: /auth/login → /api/auth/login
   * Isso ajuda a organizar a API e facilitar a versão futura
   */
  app.setGlobalPrefix('api');

  /**
   * Servição de Arquivos Estáticos
   * 
   * 1. Frontend: Servido a partir da pasta '../../frontend' (relativo ao dist/)
   *    O index: false impede que o Express sirva index.html automaticamente
   *    para rotas que não existem, permitindo que o frontend gerencie suas rotas
   * 
   * 2. Uploads: Arquivos enviados pelos usuários (fotos de perfil, etc.)
   *    Acessíveis via URL: /uploads/avatars/foto.jpg
   */
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend'), { index: false });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  /**
   * Redirecionamento da Raiz
   * Quando o usuário acessa a raiz do servidor ('/'), redireciona para '/login.html'
   * Isso garante que o primeiro acesso seja sempre a página de login
   */
  app.use('/', (req: any, res: any, next: any) => {
    if (req.path === '/') {
      res.redirect('/login.html');
    } else {
      next();
    }
  });

  /**
   * Inicialização do Servidor
   * O servidor escuta na porta definida na variável de ambiente PORT
   * ou na porta padrão 5000
   */
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`SEADI backend running on port ${port}`);
}

// Inicia a aplicação
bootstrap();
