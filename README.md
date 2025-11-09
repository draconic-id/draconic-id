# Draconic ID

A front facing web application for Draconic ID which supplies users with a public profile, a location map and a list of services that make use of Draconic ID as their authentication provider.

## 🌐 Live Site

Draconic ID is available at [https://draconic.id](https://draconic.id).

## 📄 Licensing

This project is open-source, and will soon be freely licensed. Such a license will be added at a future date. The properties of this license will be:

- You may fork the project.
- Forks must stay open-source.
- When forking, give credit to the original project.
- We do not take any liability.
- You may not use it commercially.
- Do not use our trademarks, icons, or names.

## 🤝 Contributing

Contributions are welcome, but there is no guarantee they will be included in the project. By contributing code to this repository, you grant us the full right to your code. You will be credited in the acknowledgments section of this file.

## ⚙️ Setup

The repository includes a Dockerfile and a Docker Compose file. You may use this to run the project as a Docker container.

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

**Reverse Proxy (Traefik):**

- `TRAEFIK_HOST` - Host domain for routing (e.g., `Host('draconic.id')`)
- `TRAEFIK_TLS_ENABLED` - Enable TLS/SSL (e.g., `true`)
- `TRAEFIK_CERT_RESOLVER` - Certificate resolver name (e.g., `lets-encrypt`)
- `TRAEFIK_SERVICE_PORT` - Service port for load balancer (e.g., `3000`)

## 🔌 API Endpoints

The API provides access to user profiles. All endpoints support field selection via the `fields` query parameter. Only profiles with the following privacy settings can be retrieved with the API:

- `PUBLIC`
- `UNLISTED`
- `HIDDEN` (only if authenticated)

The `showAge` boolean tells you whether the birthday will be returned with (true) or without (false) a year of birth if a birthdate has been given.

Responses are returned in JSON.

```json
{
  "id": "PkKltWOmS3dhUhUR",
  "tagline": "Owner of Draconic ID. A western dragon with black scales and blue eyes.",
  "avatar": "https://minio.bluefi.re/draconic-id/avatars/90e7847d-954c-4f58-a423-1ff574566e38",
  "background": null,
  "about": "<h1 style=\"text-align: center;\">Welcome to my Draconic ID profile!</h1><p style=\"text-align: center;\"><img src=\"https://i.ibb.co/2YncrwB9/ZQ7A85f.jpg\" style=\"max-width: 100%; height: auto; display: inline-block; margin: 0px; width: 100%;\"></p><blockquote><p style=\"text-align: center;\">\"Laat niets en niemand het vuur in jouw drakenhart ooit doven.\"</p></blockquote>",
  "color": "#060c33",
  "privacy": "PUBLIC",
  "longitude": 5.918231,
  "latitude": 50.916628,
  "links": [
    {
      "url": "https://bluefi.re",
      "name": "Website"
    }
  ],
  "createdAt": "2025-09-27T11:57:26.228Z",
  "updatedAt": "2025-11-07T20:17:32.898Z",
  "showAge": false,
  "birthDate": "05-18",
  "user": {
    "id": "wkuj1b76eL9IsL81xw0b738P6FTYXxyY",
    "name": "Bluefire",
    "createdAt": "2025-09-27T11:57:19.993Z",
    "updatedAt": "2025-11-08T23:12:38.440Z"
  }
}
```

You can try an [example request](https://draconic.id/api/profile/by-id?id=PkKltWOmS3dhUhUR) or [avatar redirect](https://draconic.id/api/avatar?profileId=PkKltWOmS3dhUhUR) as well.

### /api/profile/all

Retrieve all accessible profiles.

```bash
# Get all profiles
curl "https://draconic.id/api/profile/all"

# Get specific fields only
curl "https://draconic.id/api/profile/all?fields=id,tagline,avatar"
```

### /api/profile/by-id

Retrieve profiles by profile ID(s). The profile ID is visible in the URL when visiting someone's profile on Draconic ID.

```bash
# Single profile
curl "https://draconic.id/api/profile/by-id?id=profile123"

# Multiple profiles
curl "https://draconic.id/api/profile/by-id?ids=profile123,profile456"
```

```bash
# POST for bulk retrieval
curl -X POST "https://draconic.id/api/profile/by-id" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["profile123", "profile456"]}'
```

### /api/profile/by-account

Retrieve profiles by account ID(s). You will want to use this option if you have an application that makes use of the same identity provider and wants to fetch the Draconic ID profile for that uses. The provider value can be assumed to be `draconic-id` in most cases.

```bash
# Get profile by account
curl "https://draconic.id/api/profile/by-account?id=123&provider=draconic-id"
```

```bash
# POST for multiple accounts
curl -X POST "https://draconic.id/api/profile/by-account" \
  -H "Content-Type: application/json" \
  -d '{"accounts": [{"accountId": "account123", "providerId": "draconic-id"}]}'
```

### /api/profile/by-user

Retrieve profiles by user ID(s).

```bash
# Single user
curl "https://draconic.id/api/profile/by-user?userId=user123"

# Multiple users
curl "https://draconic.id/api/profile/by-user?userIds=user123,user456"
```

```bash
# POST for bulk retrieval
curl -X POST "https://draconic.id/api/profile/by-user" \
  -H "Content-Type: application/json" \
  -d '{"userIds": ["user123", "user456"]}'
```

### /api/avatar

Redirect to a user's avatar image. Supports the same privacy rules as profile endpoints.

```bash
# By profile ID
curl "https://draconic.id/api/avatar?profileId=123"

# By user ID
curl "https://draconic.id/api/avatar?userId=123"

# By account ID + provider
curl "https://draconic.id/api/avatar?accountId=123&providerId=draconic-id"
```

## 🙏 Acknowledgments

We extend our heartfelt gratitude to all users of the Draconic ID platform for your trust and engagement,  members of the Dragonkin.EU community for providing valuable feedback and bug reports and contributors who have directly improved and brought value to the platoform.

![Contributors](https://contrib.rocks/image?repo=draconic-id/draconic-id)

Your support and contributions make this project possible. Thank you for being part of the Draconic ID community!
