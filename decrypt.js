
/*
  This code implements the functionality to decrypt the files in a previously encrypted directory using the AES-256-CBC encryption algorithm.

  Firstly, the file containing the key and initialization vector used to encrypt the directory files is read. Then, the key and initialization vector are separated and converted from hexadecimal to a Buffer object.

  Next, the decryptDirectory function is called to decrypt the files in the directory. The function opens the directory and iterates over each file in it. If it is a file, it reads its encrypted content, creates a decipher object using the key and initialization vector, decrypts the file content, and writes the decrypted content to the original file. If it is a directory, it calls the decryptDirectory function recursively to decrypt the files in the subdirectory.

  Finally, the directory function is called with the directory to decrypt as an argument ('./toEncript' in this case).

*/

const crypto = require('crypto');
const fs = require('fs');

async function decryptDirectory(dirPath, key, iv) {
  try {
    // Open the directory
    const dir = await fs.promises.opendir(dirPath);

    //  Iterate over each file in the directory
    for await (const dirent of dir) {
      const filePath = `${dirPath}/${dirent.name}`;
      if (dirent.isFile()) {
        console.log(`Decrypting ${dirent.name}`);

        // raad the encrypted file
        const encryptedContent = await fs.promises.readFile(filePath);

        // Create decryption object using key and initialization vector
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        // Decrypt file content
        const decryptedContent = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);

        // Write the decrypted content to the original file
        await fs.promises.writeFile(filePath, decryptedContent);
      } else if (dirent.isDirectory()) {
        console.log(`\nDecrypting directory ${dirent.name}`);
        await decryptDirectory(filePath, key, iv);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function directory(dirPath) {
  try {
    // Read key and initialization vector from file
    const keysFile = await fs.promises.readFile(`./toEncript.key`, 'utf8');
    const keys = keysFile.split('\n');
    const key = Buffer.from(keys[0].replace('Key: ', ''), 'hex');
    const iv = Buffer.from(keys[1].replace('Iv: ', ''), 'hex');

    // Decrypt directory files
    await decryptDirectory(dirPath, key, iv);
  } catch (error) {
    console.log(error);
  }
}

directory('./toEncrypt');

