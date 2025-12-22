# Ryvie-rTransfer
en local
cd backend
npm install
# Optionnel mais recommandé au premier setup
npx prisma generate
npx prisma migrate dev
npx prisma db seed
# Lancer en mode dev avec reload
npm run dev
