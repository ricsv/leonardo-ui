set -e

echo 'Deploying gh-pages...'

git branch -D gh-pages
git checkout -b gh-pages
sed -i '' '/^dist\/$/d' .gitignore
npm -s run build
node tools/build-docs.js
git add docs/dist
git commit -am "Build docs"

read -p "Replace the upstream gh-pages branch with the contents of docs/dist [y/n]? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  git push origin :gh-pages
  git subtree push --prefix docs/dist origin gh-pages
  git cherry-pick c8ef92026aee57b9f7ea22f62da16eb93f477a1c
  git push
  git checkout master
  echo 'Complete'
fi
