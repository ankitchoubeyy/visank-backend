import { PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import r2 from "../configurations/r2.js";

// helper to build public url
function buildPublicUrl(key) {
  return `${process.env.R2_PUBLIC_BASE_URL}/${key}`;
}

// ============== Upload Image to R2 ==============
export async function uploadImageToR2({
  buffer,
  originalName,
  folder,
  entityId,
}) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const mimeType = mime.lookup(originalName);
  if (!mimeType || !allowedTypes.includes(mimeType)) {
    throw new Error("Only JPG, PNG, WEBP images are allowed");
  }

  const extension = mime.extension(mimeType);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const key = `${folder}/${entityId}/${fileName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // RETURN PUBLIC URL
  return buildPublicUrl(key);
}

// ============== Upload Video to R2 ==============
export async function uploadVideoToR2({
  buffer,
  originalName,
  folder,
  entityId,
}) {
  const allowedTypes = ["video/mp4", "video/webm"];

  const mimeType = mime.lookup(originalName);
  if (!mimeType || !allowedTypes.includes(mimeType)) {
    throw new Error("Only MP4 or WEBM videos are allowed");
  }

  const extension = mime.extension(mimeType);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const key = `${folder}/${entityId}/${fileName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // RETURN PUBLIC URL
  return buildPublicUrl(key);
}

// ============== Upload PDF to R2 ==============
export async function uploadPdfToR2({
  buffer,
  originalName,
  folder,
  entityId,
}) {
  const mimeType = mime.lookup(originalName);
  if (mimeType !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  const fileName = `${Date.now()}-${crypto.randomUUID()}.pdf`;
  const key = `${folder}/${entityId}/${fileName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // RETURN PUBLIC URL
  return buildPublicUrl(key);
}
