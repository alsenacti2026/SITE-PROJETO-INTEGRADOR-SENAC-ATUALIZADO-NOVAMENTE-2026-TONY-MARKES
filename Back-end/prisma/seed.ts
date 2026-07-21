import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const modules = [
  {
    order: 1,
    title: 'Iniciante',
    description: 'Primeiros passos no computador',
    icon: 'inici.png',
    lessons: [
      { order: 1, title: 'Como Ligar e Desligar', videoUrl: 'https://www.youtube.com/embed/-m7jRtUrh4U', duracao: 120 },
      { order: 2, title: 'Como usar um Mouse', duracao: 180 },
      { order: 3, title: 'Como usar o Teclado', duracao: 240 },
      { order: 4, title: 'Conhecendo o Windows', duracao: 300 },
      { order: 5, title: 'Área de trabalho', duracao: 200 },
      { order: 6, title: 'Abrindo programas', duracao: 150 },
      { order: 7, title: 'Internet básica', duracao: 250 },
      { order: 8, title: 'Wi-Fi e conexão', duracao: 180 },
      { order: 9, title: 'Usando Janelas', duracao: 220 },
    ],
  },
  {
    order: 2,
    title: 'Básico',
    description: 'Fundamentos para o dia a dia',
    icon: 'avanç.png',
    lessons: [
      { order: 1, title: 'Google e Navegação', duracao: 180 },
      { order: 2, title: 'Como Pesquisar', duracao: 240 },
      { order: 3, title: 'Digitando Texto', duracao: 300 },
      { order: 4, title: 'Usando Pontos e Acentuações', duracao: 200 },
      { order: 5, title: 'Criando e Organizando Arquivos', duracao: 250 },
      { order: 6, title: 'Noções Básicas de Arquivos', duracao: 150 },
      { order: 7, title: 'Baixando Arquivos', duracao: 180 },
      { order: 8, title: 'Criando e-mail', duracao: 300 },
      { order: 9, title: 'Comunicação online', duracao: 200 },
      { order: 10, title: 'Aplicativos Úteis', duracao: 200 },
      { order: 11, title: 'Acessibilidade rápida', duracao: 120 },
    ],
  },
  {
    order: 3,
    title: 'Avançado',
    description: 'Conceitos avançados e produtividade',
    icon: 'intermed.png',
    lessons: [
      { order: 1, title: 'Organização digital', duracao: 240 },
      { order: 2, title: 'Atualizações e cuidados', duracao: 180 },
      { order: 3, title: 'Segurança básica', duracao: 300 },
      { order: 4, title: 'Teclas de atalho (Parte 1)', duracao: 200 },
      { order: 5, title: 'Teclas de atalho (Parte 2)', duracao: 220 },
      { order: 6, title: 'Teclas de atalho (Parte 3)', duracao: 180 },
      { order: 7, title: 'Teclas de atalho (Parte 4)', duracao: 250 },
      { order: 8, title: 'Usando pen drive', duracao: 200 },
      { order: 9, title: 'Problemas simples e soluções rápidas', duracao: 300 },
    ],
  },
];

async function main() {
  const existing = await prisma.modulo.count();
  if (existing > 0) {
    console.log('Banco ja populado, ignorando seed.');
    return;
  }

  console.log('Populando banco de dados...');

  for (const mod of modules) {
    const created = await prisma.modulo.create({
      data: {
        ordem: mod.order,
        titulo: mod.title,
        descricao: mod.description,
        icone: mod.icon,
        aulas: {
          create: mod.lessons.map((l) => ({
            ordem: l.order,
            titulo: l.title,
            videoUrl: l.videoUrl || null,
            duracao: l.duracao || null,
          })),
        },
      },
    });
    console.log(`  Modulo "${created.titulo}" criado com ${mod.lessons.length} aulas`);
  }

  console.log('Banco populado com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
