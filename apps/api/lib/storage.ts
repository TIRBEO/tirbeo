import { createHmac } from 'crypto';

interface PutObjectParams {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  key: string;
  body: Buffer;
  contentType: string;
}

export async function putObject(params: PutObjectParams): Promise<void> {
  const { endpoint, accessKey, secretKey, bucket, key, body, contentType } = params;
  const url = `${endpoint}/${bucket}/${key}`;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateOnly = dateStr.slice(0, 8);

  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Content-Length': String(body.length),
    'x-amz-date': dateStr,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
  };

  const signedHeaders = Object.keys(headers).sort().join('\n');
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v}`)
    .join('\n') + '\n';

  const canonicalRequest = [
    'PUT',
    `/${bucket}/${key}`,
    '',
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    dateStr,
    `${dateOnly}/auto/s3/aws4_request`,
    createHmac('sha256', '').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const hmac = (key: string | Buffer, msg: string) =>
    createHmac('sha256', key).update(msg).digest();

  const signingKey = [
    `AWS4${secretKey}`,
    dateOnly,
    'auto',
    's3',
    'aws4_request',
  ].reduce((k, part) => hmac(k, part), Buffer.alloc(0));

  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');

  headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${accessKey}/${dateOnly}/auto/s3/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  delete headers['Content-Length'];

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`R2 upload failed (${res.status}): ${err}`);
  }
}
