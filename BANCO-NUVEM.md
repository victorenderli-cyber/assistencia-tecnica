# ☁️ Banco compartilhado (Supabase — grátis)

O site já vem com o adaptador de nuvem pronto. Sem configurar nada, ele usa o **banco local** (cada navegador tem o seu). Para o PC da loja e o celular verem os **mesmos casos**, faça 1x:

## 1. Criar o projeto (5 min, grátis)
1. Acesse https://supabase.com → **Start your project** (login com GitHub)
2. **New project** → nome `assitec-rb` → senha do banco (guarde) → região `South America (São Paulo)` → **Create**
3. Aguarde ~2 min o projeto ficar verde

## 2. Criar a tabela (1 min)
1. No menu lateral: **SQL Editor** → **New query**
2. Cole o conteúdo do arquivo `supabase-schema.sql` (na raiz do site) → **Run**
3. Tem que aparecer `Success`

## 3. Pegar as 2 chaves (1 min)
1. Menu **Project Settings** (⚙️) → **API**
2. Copie: `Project URL` (ex: `https://xyzabc.supabase.co`) e `anon public key` (texto gigante `eyJ...`)

## 4. Conectar o site (30 seg)
1. Abra o site → barra lateral → **Banco compartilhado**
2. Cole URL + chave anon → **Conectar**
3. Status vira **☁️ Nuvem conectada**. A partir daí, tudo que entra num aparelho aparece nos outros (botão **Sincronizar** puxa na hora).

## Perguntas rápidas
- **A chave anon é segura no front?** Sim por design: ela só respeita as regras (policies) do banco. Aqui a policy é aberta para uso interno da loja. Não use a chave `service_role` no site NUNCA.
- **Limite grátis?** ~500 MB de banco + 2 GB tráfego/mês — sobra para milhares de casos.
- **Voltar ao local?** Apague os 2 campos e salve: o site volta ao banco do navegador.
- **Backup?** Botão exportar continua gerando o JSON completo.
