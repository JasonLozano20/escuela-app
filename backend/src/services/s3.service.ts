import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import {s3Client, S3_BUCKET_NAME} from '../config/s3.config'
 

export class S3Service{

    //Subir archivo
    static async uploadFile(
        fileBuffer: Buffer,
        fileName: string,
        mimeType: string,
        folder: string = 'documentos'
    ): Promise<string>{
        const fileKey = `${folder}/${Date.now()}--${fileName}`

        const upload = new Upload({
            client: s3Client,
            params:{
                Bucket: S3_BUCKET_NAME,
                Key: fileName,
                Body: fileBuffer,
                ContentType: mimeType
            }
        })
        await upload.done();
        return fileKey;
    }

    //Obtener la URL para descarga
    static async getSignedDownloadUrl (filekey: string): Promise<string>{
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: filekey
        });
        const url = await getSignedUrl(s3Client, command, {expiresIn: 3600});
        return url;
    }

    //Eliminar archivo
    static async deleteFile (filekey: string): Promise<void>{
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: filekey
        });
        await s3Client.send(command);
    }
}