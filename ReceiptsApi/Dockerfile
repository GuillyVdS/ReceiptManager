# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY ./*.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/out ./

# Copy the wait-for-db script into the image
COPY wait-for-db.sh ./
RUN chmod +x wait-for-db.sh

# Expose port (adjust if needed)
EXPOSE 5152

ENV ASPNETCORE_URLS=http://+:5152

ENTRYPOINT ["dotnet", "WebServer.dll"]