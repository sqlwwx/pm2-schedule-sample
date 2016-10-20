# pm2-schedule-sample
pm2 schedule with redis
## config redis
```
redis-cli config set notify-keyspace-events Ex
```
## start
```
pm2 start production.json
```
