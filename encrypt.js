


/*
  This code encrypts the files in a directory using the AES-256-CBC symmetric encryption algorithm. The script performs the following actions:

  1 Opens the directory specified in dirPath using the opendir() method.
  2 Iterates over each file in the directory.
  3 If the file is a regular file, the script reads the file contents using fs.promises.readFile().
  4 Then, the script creates a cipher object using the key and initialization vector specified in the key and iv parameters using the crypto.createCipheriv() method.
  5 The file contents are encrypted using the cipher.update() and cipher.final() methods, and the encrypted content is written to the original file using fs.promises.writeFile().
  6 If the file is a directory, the script recursively calls the encryptDirectory() function to encrypt all files in that directory.
  7 The script generates a random key and initialization vector using crypto.randomBytes() and writes these values to a file called toEncript.key using fs.writeFileSync().
  8 Finally, the script calls the encryptDirectory() function to encrypt the files in the directory specified in dirPath using the key and initialization vector randomly generated in the previous step.
 
*/
const { opendir } = require('fs').promises;
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

async function encryptDirectory(dirPath, key, iv) {
  try {
    // Open the directory
    const dir = await opendir(dirPath);

    // Iterate over each file in the directory
    for await (const dirent of dir) {
      const filePath = `${dirPath}/${dirent.name}`;
      
      if (dirent.isFile()) {
        console.log(`Encrypting ${dirent.name}`);

        // Con este try se ignora los errores de permisos y continuar con el cifrado de otros archivos, 
        try {
          //3 Read file content
          const fileContent = await fs.promises.readFile(filePath);
          await fs.promises.chmod(filePath, 0o700);

          //4 Create an encryption object using the key and initialization vector
          const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

          //5 Encrypt file content
          const encryptedContent = Buffer.concat([cipher.update(fileContent), cipher.final()]);

          //6 Write the encrypted content to the original file
          await fs.promises.writeFile(filePath, encryptedContent);

        } catch (error) {

            console.error(`Error encrypting file ${filePath}: ${error.message}`);
        }

      } else if (dirent.isDirectory()) {
        console.log(`\nEncrypting directory ${dirent.name}`);

        await encryptDirectory(filePath, key, iv);
      }
    }
  } catch (error) {
    console.error(`Error opening directory ${dirPath}: ${error.message}`)
  }
}


async function directory(dirPath) {
  try {
    //1 Generate a random key and initialization vector
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    //2 Write the key and initialization vector to a file
    const keyAndIvString = `Key: ${key.toString('hex')}\nIv: ${ iv.toString('hex')}`;
    fs.writeFileSync('toEncript.key', keyAndIvString);

    //3 Encrypt directory files
    await encryptDirectory(dirPath, key, iv);
  } catch (error) {
    console.log(error);
  }
}

directory('./toEncrypt');




