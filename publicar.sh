# TechFix Pro — publicador automático (Git/Linux/Mac)
# Uso: bash publicar.sh
set -e
cd "$(dirname "$0")"
REPO="${1:-assistencia-tecnica}"
command -v gh >/dev/null || { echo "Instale gh: https://cli.github.com/"; exit 1; }
gh auth login -h github.com -p https -w
gh repo create "$REPO" --public --source=. --remote=origin --push || {
  git branch -M main; git add .; git commit -m "TechFix Pro deploy" || true
  git push -u origin main --force
}
OWNER=$(gh api user -q .login)
gh api "repos/$OWNER/$REPO/pages" -X POST -f build_type=workflow || true
echo "Acesse em 1-2 min: https://$OWNER.github.io/$REPO/"
echo "Actions: https://github.com/$OWNER/$REPO/actions"
