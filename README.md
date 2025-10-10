# Draconic ID

A front facing web application for Draconic ID which supplies users with a public profile, a location map and a list of services that make use of Draconic ID as their authentication provider.

## 🌐 Live Site

Draconic ID is available at [https://draconic.id](https://draconic.id).

## 📄 Licensing

This project is open-source, but is not yet freely licensed. Such a license will be added at a future date.

## 🤝 Contributing

Contributions are welcome, but there is no guarantee they will be included in the project. By contributing code to this repository, you grant us the full right to your code. You will be credited in the acknowledgments section of this file.

## ⚙️ Setup

The repository includes a Dockerfile. You may use this to run the project as a Docker container.

### Environment Variables

The following environment variables can be configured:

**Authentication (Better Auth):**
- `BETTER_AUTH_PROVIDER_ID` - Provider identifier for authentication
- `BETTER_AUTH_CLIENT_ID` - OAuth client ID
- `BETTER_AUTH_CLIENT_SECRET` - OAuth client secret
- `BETTER_AUTH_AUTHORIZATION_URL` - Authorization endpoint URL
- `BETTER_AUTH_TOKEN_URL` - Token endpoint URL
- `BETTER_AUTH_SECRET` - Secret key for authentication
- `BETTER_AUTH_URL` - Base URL for the application

**Database:**
- `PRISMA_URL` - PostgreSQL database connection string

**Maps (Mapbox):**
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Public Mapbox access token for map functionality

**S3 File Storage (MinIO):**
- `NEXT_PUBLIC_MINIO_ENDPOINT` - Public MinIO endpoint URL
- `NEXT_PUBLIC_MINIO_BUCKET` - MinIO bucket name
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key

## 🙏 Acknowledgments

We extend our heartfelt gratitude to all users of the Draconic ID platform for your trust and engagement,  members of the Dragonkin.EU community for providing valuable feedback and bug reports and contributors who have directly improved and brought value to the platoform.

![Contributors](https://contrib.rocks/image?repo=jelle619/draconic-id)

Your support and contributions make this project possible. Thank you for being part of the Draconic ID community!
