# 15 Minutos — Guia de Deploy

## Passo 1 — Rodar o SQL no Supabase

1. Entre em app.supabase.com → seu projeto
2. Clique em **SQL Editor** no menu lateral
3. Clique em **New query**
4. Copie TODO o conteúdo do arquivo `SUPABASE_SQL.sql`
5. Cole no editor e clique em **Run**
6. Deve aparecer "Success" — as tabelas foram criadas

---

## Passo 2 — Colocar o código no GitHub

1. Entre em github.com → seu repositório `15minutos-app`
2. Clique em **uploading an existing file** (ou "Add file" → "Upload files")
3. Arraste TODOS os arquivos desta pasta para a área de upload
4. Clique em **Commit changes**

---

## Passo 3 — Deploy no Vercel

1. Entre em vercel.com → seu projeto
2. Se ainda não importou: **Add New Project** → selecione `15minutos-app`
3. Antes de clicar Deploy, clique em **Environment Variables** e adicione:

```
VITE_SUPABASE_URL = https://vcxcupowvdszxknbdafd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjeGN1cG93dmRzenhrbmJkYWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Nzk3NTEsImV4cCI6MjA5NTU1NTc1MX0.V7TEyKhkCo5z4njA-DrzWPiQUdd11oJORcYBZyZsJTU
```

4. Clique **Deploy**
5. Em ~2 minutos o Vercel gera o link: `15minutos-app.vercel.app`

---

## Compartilhar com alunos

Envie o link para cada aluno. Na primeira vez:
- Eles colocam nome + e-mail
- O app cria o perfil automaticamente
- Da segunda vez em diante, entram com o mesmo e-mail e o progresso reaparece

---

## Dúvidas comuns

**O aluno perdeu o progresso?**
→ Basta entrar com o mesmo e-mail de antes. O progresso fica salvo no Supabase.

**Como ver os dados de todos os alunos?**
→ No Supabase → Table Editor → tabela `usuarios` → você vê todos os cadastrados.

**O app parou de funcionar?**
→ Verifique se as variáveis de ambiente no Vercel estão corretas.
