import fs from "fs";
import csv from "csv-parser";
export class FileUtils{
   public static loadDomainList(filePath:string):Array<string>{
        const content = fs.readFileSync(filePath, 'utf-8');
        return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))     // 去除空行和全行注释
        .map(line => line.split('#')[0].trim())           // 去除行尾注释
        .filter(line => line.length > 0);
    }

    public static readCsv2IpArray(filepath:string,max:number):Promise<Array<string>>{
        return new Promise((resolve, reject) => {
            const results:Array<string> = [];
            let count=0;
            fs.createReadStream(filepath)
                .pipe(csv())
                .on('data', (data) =>{
                    if (count<max){
                        count++
                        results.push(data['IP 地址'])
                    }
                })
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }
}