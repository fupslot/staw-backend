## Option A

### Create the TLS Certificate

TLS/SSL works by using a combination of a public certificate and a private key. The SSL key is kept secret on the server. It is used to encrypt content sent to clients. The SSL certificate is publicly shared with anyone requesting the content. It can be used to decrypt the content signed by the associated SSL key.

We can create a self-signed key and certificate pair with OpenSSL in a single command:

```sh
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout `pwd`/conf/nginx/tls/example.net/example.net.key.pem -out `pwd`/conf/nginx/tls/example.net/example.net.crt.pem
```

Before we go over that, let’s take a look at what is happening in the command we are issuing:

* `openssl`: This is the basic command line tool for creating and managing OpenSSL certificates, keys, and other files.
* `req`: This subcommand specifies that we want to use X.509 certificate signing request (CSR) management. The “X.509” is a public key infrastructure standard that SSL and TLS adheres to for its key and certificate management. We want to create a new X.509 cert, so we are using this subcommand.
* `-x509`: This further modifies the previous subcommand by telling the utility that we want to make a self-signed certificate instead of generating a certificate signing request, as would normally happen.
* `-nodes`: This tells OpenSSL to skip the option to secure our certificate with a passphrase. We need Nginx to be able to read the file, without user intervention, when the server starts up. A passphrase would prevent this from happening because we would have to enter it after every restart.
* `-days 365`: This option sets the length of time that the certificate will be considered valid. We set it for one year here.
* `-newkey rsa:2048`: This specifies that we want to generate a new certificate and a new key at the same time. We did not create the key that is required to sign the certificate in a previous step, so we need to create it along with the certificate. The rsa:2048 portion tells it to make an RSA key that is 2048 bits long.
* `-keyout`: This line tells OpenSSL where to place the generated private key file that we are creating.
* `-out`: This tells OpenSSL where to place the certificate that we are creating.


We will be asked a few questions about our server in order to embed the information correctly in the certificate.
Fill out the prompts appropriately. The most important line is the one that requests the Common Name (e.g. server FQDN or YOUR name). You need to enter the domain name associated with your server or, more likely, your server’s public IP address.

Example
```
Country Name (2 letter code) [AU]:IL
State or Province Name (full name) [Some-State]:Tel Aviv
Locality Name (eg, city) []:Tel Aviv
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Example, Inc.
Organizational Unit Name (eg, section) []:Development
Common Name (e.g. server FQDN or YOUR name) []:*.example.net
Email Address []:john.doe@example.net
```

While we are using OpenSSL, we should also create a strong Diffie-Hellman group, which is used in negotiating Perfect Forward Secrecy with clients.

```sh
sudo openssl dhparam -out `pwd`/conf/nginx/tls/example.net/dhparam.pem 2048
```

See how configure NGINX to use TLS [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)


## Options B

Self-signed certificate with the custom CA

### Create root key
```sh
openssl genrsa -out `pwd`/conf/nginx/tls/example.net/ca.example.net.key.pem 4096
```


### Create and sign the root certificate
```sh
openssl req -x509 -new -nodes -key `pwd`/conf/nginx/tls/example.net/ca.example.net.key.pem -sha256 -days 1024 -out `pwd`/conf/nginx/tls/example.net/ca.example.net.crt.pem
```


### Create the certificate (done each server)
```sh
openssl genrsa -out `pwd`/conf/nginx/tls/example.net/example.net.key.pem 2048
```

### Create CSR 

```sh
openssl req -new -key `pwd`/conf/nginx/tls/example.net/example.net.key.pem -out `pwd`/conf/nginx/tls/example.net/example.net.csr
```

Verify the CSR's content

```sh
openssl req -in `pwd`/conf/nginx/tls/example.net/example.net.csr -noout -text
```

### Generate the certificate
```sh
openssl x509 -req -in `pwd`/conf/nginx/tls/example.net/example.net.csr -CA `pwd`/conf/nginx/tls/example.net/ca.example.net.crt.pem -CAkey `pwd`/conf/nginx/tls/example.net/ca.example.net.key.pem -CAcreateserial -out `pwd`/conf/nginx/tls/example.net/example.net.crt.pem -days 500 -sha256
```

**Verify the certificate content**

```sh
openssl x509 -in `pwd`/conf/nginx/tls/example.net/example.net.crt.pem -text -noout
```