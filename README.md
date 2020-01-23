# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs to improve readability (à la bit.ly).

## Final Product

!["Log in Page."](https://github.com/mxrosenthal/tinyapp/blob/master/docs/wideLOGIN.png?raw=true)
!["Create a new TinyURL."](https://github.com/mxrosenthal/tinyapp/blob/master/docs/NewURL.png?raw=true)
!["Display the URLs you have saved."](https://github.com/mxrosenthal/tinyapp/blob/master/docs/MyURLs.png?raw=true)

Images depict the login page, where you can submit a link for 'tiny-fying', as well as your list of saved tiny URLS.

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command. Ex: `npm install express`).
- Run the development web server using the `node express_server.js` command.
- Access the app in your browswer by visiting localhost:PORT#
- If you have an account you can log in and start shortening URLs!
- If you are new, you can quickly register.
- A long URL must be prefaced with `http://`
- Add, edit, or delete as many links as you'd like!
- Visit short links at localhost:PORT#/u/{shortURL}
- Tell your friens about all the positive ways this app changed your life.
