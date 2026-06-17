# Guia de Deploy — L2E Prime Solutions

## Credenciais padrão (após seed)

| Usuário | E-mail | Senha |
|---|---|---|
| Lucas Souza (Admin) | lucas@l2eprime.com.br | l2e@2026 |
| Equipe Comercial | comercial@l2eprime.com.br | l2e@2026 |

**Troque as senhas após o primeiro acesso!** (Perfis de Acesso → editar usuário)

---

## Passo a passo para colocar online

### 1. Criar banco de dados PostgreSQL (Neon — gratuito)

1. Acesse **https://neon.tech** e crie uma conta
2. Clique em **New Project** → dê o nome `l2e-sistema`
3. Na tela do projeto, copie a **Connection string** (começa com `postgresql://...`)
4. Guarde essa string — vai usar no passo 3

### 2. Ajustar o schema para PostgreSQL

No arquivo `prisma/schema.prisma`, linha 6, mude de:
```
provider = "sqlite"
```
para:
```
provider = "postgresql"
```

### 3. Subir o código para o GitHub

1. Acesse **https://github.com** → crie uma conta se não tiver
2. Clique em **New repository** → nome: `l2e-sistema` → Private → Create
3. No terminal do computador, dentro da pasta `l2e-sistema`:
```bash
git init
git add .
git commit -m "Sistema L2E Prime Solutions"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/l2e-sistema.git
git push -u origin main
```

### 4. Deploy na Vercel

1. Acesse **https://vercel.com** → crie conta com o GitHub (botão "Continue with GitHub")
2. Clique em **Add New → Project**
3. Selecione o repositório `l2e-sistema`
4. Na seção **Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `DATABASE_URL` | A connection string do Neon (passo 1) |
| `NEXTAUTH_SECRET` | Gere em https://generate-secret.vercel.app/32 |
| `NEXTAUTH_URL` | A URL que a Vercel vai te dar (ex: https://l2e-sistema.vercel.app) |

5. Clique em **Deploy**

### 5. Inicializar o banco em produção

Após o deploy, acesse:
```
https://seu-sistema.vercel.app/api/seed
```
(faça um POST — use o botão "Dados Demo" no Dashboard após o primeiro login)

Na verdade, o seed pode ser executado direto do Dashboard após fazer login:
1. Acesse o sistema → faça login com qualquer senha temporária
2. No Dashboard, clique em **"Dados Demo"** para carregar os dados reais

---

## Domínio personalizado (opcional)

Na Vercel, vá em **Settings → Domains** e adicione seu domínio (ex: `sistema.l2eprime.com.br`).
Configure o DNS no seu provedor de domínio conforme as instruções da Vercel.

---

## Custo estimado

| Serviço | Plano | Custo |
|---|---|---|
| Vercel | Hobby (gratuito) | R$ 0/mês |
| Neon | Free (0.5 GB) | R$ 0/mês |
| Domínio .com.br | Registro.br | ~R$ 40/ano |
