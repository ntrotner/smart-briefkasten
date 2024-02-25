## Setup
Run `./scripts/setup.sh`

## Proxy
[NGINX Proxy Manager](https://nginxproxymanager.com/)

```
Email:    admin@example.com / test@test.de
Password: changeme
```
### Ports
- `80`: HTTP 
- `443`: HTTPS
- `3000`: Admin Page 

### Sites
add to hosts:

```
127.0.0.1       template.de
127.0.0.1       api.template.de
127.0.0.1       db.template.de
```

- [template.de](http://template.de)
- [api.template.de](http://api.template.de)
- [api.template.de/debug/statsviz](http://api.template.de/debug/statsviz)
- [db.template.de/_utils](http://db.template.de/_utils)
- [Setup DB](http://db.template.de/_utils#setup)
