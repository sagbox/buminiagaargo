FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY target/*.jar app.jar

ENV JAVA_OPTS: "-Xms64m -Xmx160m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m"

EXPOSE 8081

HEALTHCHECK --interval=60s --timeout=3s --retries=2 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]