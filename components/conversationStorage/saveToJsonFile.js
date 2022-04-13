var fs = require("fs");
const filepath = __dirname+ "../../../database/jsonFiles/";
const filename = __filename.slice(__dirname.length + 1, -3);

const { log } = require("../../config/logger");

async function saveToJsonFile(conversation) {
    const jsonFileName = filepath +conversation.conversationId+".json";
    
    fs.open(jsonFileName,'r',function(fileExists) {
        if (!fileExists) {
            log.info(`${filename} > saveToJsonFile  : File already exists!`);

            fs.readFile(jsonFileName, function (err,data) 
            {
                data = JSON.parse(data)
                data[conversation.transactionId] = conversation
                fs.writeFile( jsonFileName,JSON.stringify(data), (err) => {
                    if (err){
                        log.error(`${filename} > saveToJsonFile : ${err}`);
                        return false;
                    }
                    log.info(`${filename} > saveToJsonFile  : Successfully updated file!`);
                    return true;
                });
            });
         
    
        } else {
            log.info(`${filename} > saveToJsonFile  : File doesn't exists!`);
            fs.writeFile( jsonFileName,JSON.stringify({[conversation.transactionId] : conversation}), (err) => {
                if (err){
                    log.error(`${filename} > saveToJsonFile : ${err}`);
                    return false;
                }
                log.info(`${filename} > saveToJsonFile  : Successfully created file!`);
                return true;
            });
        }
      });
    return false;
}


module.exports = saveToJsonFile;