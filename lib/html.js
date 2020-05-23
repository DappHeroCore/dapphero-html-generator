const createHtmlTemplate = (children, contractName) => `
<!DOCTYPE html>

<html lang="en">
  <head>
    <title>DappHero | Contract ${contractName}</title>

    <meta charset="UTF-8" />
    <meta name="author" content="DappHero" />
    <meta name="description" content="DappHero | Contract ${contractName}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>

  <body>
    ${children}
  </body>

</html>
`;

module.exports = { createHtmlTemplate };
