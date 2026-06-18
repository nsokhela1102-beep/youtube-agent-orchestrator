param(
  [string]$branch = "feature/ci-headless-concurrency",
  [string]$title = "Add CI caching, headless & concurrency support",
  [string]$body = "Adds CI caching for npm and Playwright, headless options, and concurrency support."
)

Write-Host "Creating branch $branch and committing changes..."

git checkout -b $branch
if ($LASTEXITCODE -ne 0) { git checkout $branch }

git add -A
git commit -m "$title"

git push -u origin $branch

# Create a PR using gh if available
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh pr create --title "$title" --body "$body" --base main
} else {
  Write-Host "'gh' CLI not found. Please create a PR manually or install GitHub CLI: https://cli.github.com/"
}
