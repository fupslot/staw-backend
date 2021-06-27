########################
# WARNING: Run inside VM

if [ ! -d /etc/nginx/example.net ]; then
  sudo mkdir -p /etc/nginx/example.net
fi

if [ ! -d /etc/nginx/tls ]; then
  sudo mkdir -p /etc/nginx/tls/example.net
fi

sudo rm /etc/nginx/sites-enabled/*
sudo rm /etc/nginx/sites-available/*
sudo rm /etc/nginx/example.net/*

sudo cp -R /var/staw-backend/conf/nginx/example.net/* /etc/nginx/example.net/
sudo cp -R /var/staw-backend/conf/nginx/sites-available/* /etc/nginx/sites-available/
sudo cp /var/staw-backend/conf/nginx/nginx.conf /etc/nginx/nginx.conf

# Copying TLS certificates
sudo cp -R /var/staw-backend/conf/nginx/tls/example.net/* /etc/nginx/tls/example.net/

# Link example.net
sudo ln -s /etc/nginx/sites-available/debug.example.net /etc/nginx/sites-enabled/debug.example.net
echo "NGINX debug config copied!"

# TODO: Popup dialog "Debug example.net [n/Y]"


# NGINX service
# TODO: Popup dialog "Restart NGINX [n/Y]"
sudo systemctl restart nginx
echo "NGINX restarted!"