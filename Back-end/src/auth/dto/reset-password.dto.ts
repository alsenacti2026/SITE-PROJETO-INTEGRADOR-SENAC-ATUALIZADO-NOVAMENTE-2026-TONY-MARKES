/**
 * ========================================================================
 * DTO DE REDEFINIÇÃO DE SENHA - Validação com Código
 * ========================================================================
 * 
 * Este DTO define a estrutura para redefinir a senha usando o código
 * de recuperação recebido por email.
 * 
 * Validações:
 * - email: Email do usuário
 * - code: Código de 6 dígitos (string)
 * - newPassword: Nova senha com complexidade mínima
 * 
 * O código de recuperação:
 * - Tem 6 dígitos numéricos
 * - Expira em 30 minutos
 * - Só pode ser usado uma vez
 * - É enviado por email no endpoint forgot-password
 * 
 * A nova senha:
 * - Deve ter no mínimo 8 caracteres
 * - Deve conter letra maiúscula, número e caractere especial
 * - É criptografada com bcrypt antes de salvar
 * 
 * Exemplo de requisição:
 * POST /api/auth/reset-password
 * {
 *   "email": "joao@email.com",
 *   "code": "123456",
 *   "newPassword": "NovaSenha@456"
 * }
 * 
 * Resposta bem-sucedida:
 * {
 *   "message": "Password reset successfully"
 * }
 * ========================================================================
 */

import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

/**
 * DTO para redefinição de senha com código de recuperação.
 * 
 * Este DTO valida os três campos necessários para completar
 * o processo de recuperação de senha.
 */
export class ResetPasswordDto {
  /**
   * Email do usuário.
   * 
   * Deve ser o MESMO email usado na solicitação de recuperação.
   * O código está vinculado ao email no banco de dados.
   */
  @IsEmail()
  email: string;

  /**
   * Código de recuperação de 6 dígitos.
   * 
   * Validações:
   * - @IsString: Deve ser uma string
   * 
   * Nota: Não usamos @IsNumberString pois o código pode ter zeros à esquerda
   * (ex: "012345") que seriam perdidos se convertido para número.
   * 
   * O código é validado no service contra o armazenado no banco.
   */
  @IsString()
  code: string;

  /**
   * Nova senha do usuário.
   * 
   * Validações:
   * - @IsString: Deve ser uma string
   * - @MinLength(8): Mínimo de 8 caracteres
   * - @Matches: Padrão regex que exige:
   *   - (?=.*[A-Z]): Pelo menos uma letra maiúscula
   *   - (?=.*\d): Pelo menos um número
   *   - (?=.*[!@#$%^&*(),.?":{}|<>]): Pelo menos um caractere especial
   * 
   * A senha deve ser DIFERENTE da anterior (recomendação de segurança).
   * Esta validação não está neste DTO, mas pode ser adicionada no service.
   * 
   * Exemplo válido: "NovaSenha@456"
   * Exemplo inválido: "senhaforte" (falta maiúscula, número e especial)
   */
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain uppercase letter, number and special character',
  })
  newPassword: string;
}
