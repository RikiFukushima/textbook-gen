/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// MP4 のコピーは package.json の build スクリプトで
// `node scripts/copy-videos.mjs` を呼んで対応する。
// next build → copy-videos.mjs の順で実行される。
const nextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
