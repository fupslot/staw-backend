########################
# WARNING: Run inside VM


sudo rm /etc/nginx/sites-enabled/*
sudo rm /etc/nginx/sites-available/*
sudo rm /etc/nginx/example.net/*

sudo cp -R /var/staw/conf/nginx/example.net/* /etc/nginx/example.net/
sudo cp -R /var/staw/conf/nginx/sites-available/* /etc/nginx/sites-available/
sudo cp /var/staw/conf/nginx/nginx.conf /etc/nginx/nginx.conf

# Link example.net
sudo ln -s /etc/nginx/sites-available/debug.example.net /etc/nginx/sites-enabled/debug.example.net
echo "NGINX debug config copied!"

# TODO: Popup dialog "Debug example.net [n/Y]"


# NGINX service
# TODO: Popup dialog "Restart NGINX [n/Y]"
sudo systemctl restart nginx
echo "NGINX restarted!"