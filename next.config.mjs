/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      instrumentationHook: true,
    },
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            {
              key: "x-forwarded-for",
              value: "{ip}",
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  