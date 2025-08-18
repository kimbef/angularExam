# README — quick start
# 1) Create Angular app (Angular 17+)
npm create @angular@latest blog-app -- --standalone --style=css
cd blog-app

# 2) Add Firebase SDK + AngularFire
ng add @angular/fire@latest
# When prompted, pick your Firebase project, enable Auth & Realtime Database.
# If you skip the prompt, set environments manually as shown below.

npm i firebase@latest

# 3) Run
npm start