docker cp $(docker ps -q --filter name=caddy):/data/caddy/pki/authorities/local/root.crt ./root.crt
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain root.crt