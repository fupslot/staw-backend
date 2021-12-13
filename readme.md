## References
- [The State of OAuth (by Aaron Parecki)](https://www.youtube.com/watch?v=ELdFoIYTBL8)
- [OAuth 2.0 Playground](https://www.oauth.com/playground/)
- [The Nuts and Bolts of OAuth 2.0 (by Aaron Parecki)](https://www.udemy.com/course/oauth-2-simplified/)


## Content

* [Nginx Setup](#nginx-enabled)
* [Creating SystemD Service File](#systemd)
* [Enabled Sites](#sites-enabled)
* [Debug Mode](#debug)
* [frontend](docs/frontend.md)
* [REST API Reference](#rest-api-refs)
* [Mount with SSHFS](#sshfs-mount)

## TODO

- SSO - Protecting services using passportjs + additional strategies. Influenced by [vouch-proxy](https://github.com/vouch/vouch-proxy) 
    - Using OAuth2 Service for managing access tokens might be a good idea [oauth2-server](https://oauth2-server.readthedocs.io/en/latest/)
    - (optional): Building authorization service using [Ory.sh](https://www.ory.sh/developer/)
- OPA - RBAC, Policy, Rule Engine
    - Learn how to 
- https://github.com/seknox/trasa
- ZeroTrust - [trasa](https://github.com/seknox/trasa) 
    - [Proxying HTTP/HTTPS requests (httptoolkit)](https://httptoolkit.tech/blog/javascript-mitm-proxy-mockttp/)
    - [Connecting to remote SSH server](https://stackoverflow.com/questions/38689707/connecting-to-remote-ssh-server-via-node-js-html5-console)
    - [Connecting to remote VNC server](https://blog.mgechev.com/2013/08/30/vnc-javascript-nodejs/)
    - [Connecting to remote RDP server](https://github.com/citronneur/mstsc.js)
- [mockttp](https://github.com/httptoolkit/mockttp)

## <a name="nginx-setup"></a> Nginx Setup

[How To Install Nginx on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04)

**Nginx Config**

Copy NGINX config files into VM. [NGINXConfig](https://www.digitalocean.com/community/tools/nginx) helps easy tweak the configuration files.


```sh
/var/staw/conf/nginx/copy.sh
```

> WARNING! Run `copy.sh` script inside VM only

[Deploying NGINX as an API Gateway](https://www.nginx.com/blog/deploying-nginx-plus-as-an-api-gateway-part-1/)

## <a name="systemd"></a> Creating SystemD Service File

```sh
sudo cp /var/staw/conf/api.service /lib/systemd/system/
sudo cp /var/staw/conf/auth.service /lib/systemd/system/
```

Enabling services to run when a machine boots up:

```sh
sudo systemctl enable api.service
sudo systemctl enable auth.service
```

Running services:

```sh
sudo systemctl start api.service
sudo systemctl start auth.service
```

Checking status

```sh
sudo systemctl status api.service
sudo systemctl status auth.service
```

## <a name="sites-enabled"></a> Sites Enable/Disable

Required restart NGINX.

**API**

```sh
# Enable
sudo ln -s /etc/nginx/sites-available/example.net /etc/nginx/sites-enabled/example.net

# Disable
sudo rm /etc/nginx/sites-enabled/example.net
```

**Debug**

```sh
# Enable
sudo ln -s /etc/nginx/sites-available/debug.example.net /etc/nginx/sites-enabled/debug.example.net

# Disable
sudo rm /etc/nginx/sites-enabled/debug.example.net
```


## <a name="debug"></a> Run Debug Mode

    Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
    
    When machine booted up the API service will be running in Production mode. In order to switch to Debug you need to stop Production first.

**Stop Production**

```sh
sudo systemctl stop api.service
```

**Start Debug**

```sh
cd /var/api && npm run debug
```


## <a name="rest-api-refs"></a> REST API Reference

### Creating New Zero Trust Service

```
POST /api/zts/create
Content-Type: `application/json`
```


## <a name="sshfs-mount"></a> Mount with SSHFS

Installating packages can be found here

[macFUSE](https://osxfuse.github.io/)

On macOs we need to create a new folder where we going to mount a directory from
a remote host.

    Note: Before mouting a directory I suggest to verify that you can actually ssh into a remote host. Consider the example this command should work `ssh ubuntu@api.example.net`

```sh
# mount backend
sshfs ubuntu@api.example.net:/var/staw-backend /Users/eugenebrodsky/Projects/staw-backend

# mount ui
sshfs ubuntu@api.example.net:/var/staw-ui /Users/eugenebrodsky/Projects/staw-ui
```
