const http = require('http');
const {
  mkdir,
  readdirSync,
  readFileSync,
  writeFile,
  unlinkSync,
  appendFileSync,
} = require('fs');
const users = require('./database/users.json');

const server = http.createServer((req, res) => {
  let data;
  switch (req.url) {
    case '/':
      req.on('data', (chunk) => {
        data = JSON.parse(chunk.toString());
      });
      req.on('end', () => {
        console.log('root', typeof data);
        return res.end();
      });
      break;
    case '/users':
      switch (req.method) {
        case 'POST':
          req.on('data', (chunk) => {
            data = JSON.parse(chunk.toString());
          });
          req.on('end', () => {
            console.dir(data);
            const userInfo = {};
            try {
              const { email, password } = data;
              userInfo.email = email;
              userInfo.password = password;
              userInfo.filesCreated = 0;
              userInfo.filesPresent = 0;
            } catch (error) {
              res.writeHead(400);
              res.end('email and password is required!');
            }
            const isUserPresent = users.every(
              (user) => user.email !== userInfo.email
            );
            if (!isUserPresent) {
              res.writeHead(403);
              return res.end('User already exist');
            }
            return mkdir(`./database/drive/${userInfo.email}`, () => {
              users.push(userInfo);
              writeFile(
                './database/users.json',
                JSON.stringify(users),
                (err) => {
                  if (err) {
                    res.writeHead(500);
                    return res.end(err.message);
                  }
                  res.writeHead(201);
                  return res.end('Account created successfully');
                }
              );
            });
          });
          break;
        default:
          res.writeHead(403);
          res.end('Nothing to see here');
          break;
      }
      break;
    case '/files':
      switch (req.method) {
        case 'GET':
          req.on('data', (chunk) => {
            data = JSON.parse(chunk.toString());
          });
          req.on('end', () => {
            console.log('files get', typeof data);
            res.end();
          });
          break;
        case 'POST':
          req.on('data', (chunk) => {
            data = JSON.parse(chunk.toString());
          });
          req.on('end', () => {
            const fileInfo = {};
            try {
              const { fileContent, email } = data;
              fileInfo.fileContent = fileContent;
              fileInfo.email = email;
            } catch (error) {
              res.writeHead(400);
              res.end('email and file content is required!');
            }
            const { fileContent, email } = fileInfo;
            const isUserPresent = users.find((user) => user.email === email);
            if (!isUserPresent) {
              res.writeHead(403);
              return res.end('User not found');
            }
            return writeFile(
              `./database/drive/${email}/${isUserPresent.filesCreated + 1}.txt`,
              fileContent,
              (err) => {
                if (err) {
                  res.writeHead(500);
                  return res.end(err.message);
                }
                const userData = users.map((user) => {
                  if (user.email === email) {
                    user.filesCreated++;
                    user.filesPresent++;
                    return user;
                  }
                  return user;
                });
                writeFile(
                  './database/users.json',
                  JSON.stringify(userData),
                  (error) => {
                    if (error) {
                      res.writeHead(500);
                      return res.end(err.message);
                    }
                    res.writeHead(201);
                    return res.end(`file created for user ${email}`);
                  }
                );
              }
            );
          });
          break;
        case 'PUT':
          req.on('data', (chunk) => {
            data = JSON.parse(chunk.toString());
          });
          req.on('end', () => {
            console.log('files put', typeof data);
            res.end();
          });
          break;
        case 'DELETE':
          req.on('data', (chunk) => {
            data = JSON.parse(chunk.toString());
          });
          req.on('end', () => {
            console.log('files delete', typeof data);
            res.end();
          });
          break;
        default:
          res.writeHead(403);
          res.end('invalid request!');
          break;
      }
      break;
    default:
      res.writeHead(404);
      res.end('Page not found');
      break;
  }
});

const port = 3000;

server.listen(port, () => {
  console.log(`listening to port ${port}`);
});
