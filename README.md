## oauth2-server

This is my personal nodejs oauth2 server project

#### Usage

Development, port `3000`:
```
npm run dev
// To stop all pm2 instance:
pm2 stop all && pm2 del all
```
\
Debugging:
```
npm run debug
```

\
Build production:
```
npm run build
```

\
Run production (using `pm2`) on port `8080`:
```
npm start
```

### Todo / Planning
- [ ] [Gracefully reloading down your script](https://github.com/remy/nodemon#gracefully-reloading-down-your-script)
- [ ] Write a front-end to management clients (add client, update, remove, like github for example)
     + Check this out for more info: https://www.oauth.com/oauth2-servers/client-registration/registering-new-application/

