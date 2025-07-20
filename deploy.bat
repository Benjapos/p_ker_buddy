@echo off
echo Deploying P_Ker Buddy to Vercel...

echo Building frontend...
call npm run build

echo Installing Vercel CLI...
call npm install -g vercel

echo Deploying frontend...
call vercel --prod

echo Deploying backend...
cd backend
call vercel --prod
cd ..

echo Deployment complete!
echo Your app will be available at the URLs shown above.
pause 