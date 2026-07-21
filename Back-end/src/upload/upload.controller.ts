/**
 * ========================================================================
 * CONTROLADOR DE UPLOAD - Upload de Fotos de Perfil
 * ========================================================================
 * 
 * Este controlador expõe o endpoint para upload de fotos de perfil.
 * 
 * Endpoint disponível:
 * - POST /api/auth/upload-photo - Upload de foto de perfil
 * 
 * Configurações de upload:
 * - Tamanho máximo: 5MB
 * - Tipos permitidos: JPG, PNG, WebP, GIF
 * - Local: /uploads/avatars/
 * - Nome do arquivo: timestamp + número aleatório + extensão
 * 
 * Fluxo:
 * 1. Usuário seleciona arquivo no frontend
 * 2. Frontend envia via POST multipart/form-data
 * 3. Multer processa o arquivo (validação, armazenamento)
 * 4. Controller atualiza o banco de dados
 * 5. Remove foto antiga (se existir)
 * 6. Retorna URL da nova foto
 * 
 * Segurança:
 * - Autenticação JWT obrigatória
 * - Validação de MIME type
 * - Limite de tamanho
 * - Limpeza de fotos antigas
 * ========================================================================
 */

import {
  Controller, Post, UseGuards, Req, UploadedFile,
  UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Configurações de upload.
 */
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB em bytes

/**
 * Controlador de upload.
 * 
 * Este controlador usa Multer para processar uploads de arquivo.
 * O Multer é um middleware do Express para lidar com multipart/form-data.
 */
@Controller()
export class UploadController {
  /**
   * Injeção de dependência do PrismaService.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Endpoint para upload de foto de perfil.
   * 
   * POST /api/auth/upload-photo
   * 
   * Requer autenticação: SIM (JWT)
   * 
   * Content-Type: multipart/form-data
   * Campo: photo (arquivo)
   * 
   * Configurações do Multer:
   * - storage: Armazenamento em disco (diskStorage)
   * - limits: Tamanho máximo de 5MB
   * - fileFilter: Validação de MIME type
   * 
   * Retorna:
   * - fotoUrl: URL da foto uploadada
   * 
   * Erros:
   * - 400 Bad Request: Arquivo inválido ou não enviado
   * - 413 Payload Too Large: Arquivo muito grande (>5MB)
   */
  @UseGuards(JwtAuthGuard)
  @Post('auth/upload-photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      // Configuração de armazenamento em disco
      storage: diskStorage({
        // Diretório de destino: /uploads/avatars/
        destination: join(__dirname, '..', '..', 'uploads', 'avatars'),
        
        // Gera nome único para o arquivo
        // Formato: timestamp-número aleatório.extensão
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
          cb(null, unique + extname(file.originalname));
        },
      }),
      
      // Limite de tamanho: 5MB
      limits: { fileSize: MAX_SIZE },
      
      // Filtro de validação de tipo de arquivo
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.'), false);
        }
      },
    }),
  )
  async uploadPhoto(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // Valida se um arquivo foi enviado
    if (!file) throw new BadRequestException('Nenhum arquivo enviado.');

    // Busca o usuário atual
    const user = await this.prisma.usuario.findUnique({ where: { id: req.user.id } });
    if (!user) throw new BadRequestException('Usuário não encontrado.');

    // Remove foto anterior se existir
    // Isso evita acúmulo de arquivos não utilizados
    if (user.fotoUrl) {
      const oldPath = join(__dirname, '..', '..', 'uploads', 'avatars', user.fotoUrl.replace('/uploads/avatars/', ''));
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    // Gera URL da nova foto
    const fotoUrl = '/uploads/avatars/' + file.filename;

    // Atualiza o banco de dados com a nova URL
    await this.prisma.usuario.update({
      where: { id: req.user.id },
      data: { fotoUrl },
    });

    return { fotoUrl };
  }
}
