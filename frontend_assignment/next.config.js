/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,//is sort of a helper component that will help you write better react components
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {//configratution befor changes buildId: String - The build id, used as a unique identifier between builds
        // dev: Boolean - Indicates if the compilation will be done in development
        // isServer: Boolean - It's true for server-side compilation, and false for client-side compilation
        // defaultLoaders: Object - Default loaders used internally by Next.js:
        // babel: Object - Default babel-loader configuration
        
        if (!isServer) {//will be true if it's client side
            config.plugins.push(
                new webpack.ProvidePlugin({
                    global: "global"
                })
            )

            config.resolve.fallback = {
                fs: false,
                stream: false,
                crypto: false,
                os: false,
                readline: false,
                ejs: false,
                assert: require.resolve("assert"),
                path: false
            }

            return config//rturn cnfig when client side
        }

        return config //if it's server side the confiugrations will be sent without changes
    }
}

module.exports = nextConfig
