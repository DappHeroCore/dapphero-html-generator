const createHtmlTemplate = (children, contractName) => `
<!DOCTYPE html>

<html lang="en">
  <head>
    <title>DappHero | Contract ${contractName}</title>

    <meta charset="UTF-8" />
    <meta name="author" content="Your name" />
    <meta name="description" content="Brief description" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <link rel="stylesheet" href="https://unpkg.com/purecss@2.0.3/build/pure-min.css" />
  </head>

  <body>
    ${children}
  </body>

</html>
`;

module.exports = { createHtmlTemplate };
