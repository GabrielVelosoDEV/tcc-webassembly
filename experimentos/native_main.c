/* native_main.c — bancada nativa: mesmos parâmetros da bancada web (5 aquecimentos + 10 medições) */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
double simulate(int n, int steps);
static double now_ms(void){ struct timespec t; clock_gettime(CLOCK_MONOTONIC,&t); return t.tv_sec*1e3+t.tv_nsec/1e6; }
int main(int argc, char **argv){
  int n = argc>1?atoi(argv[1]):512, steps = argc>2?atoi(argv[2]):200, warm=5, runs=10;
  double c=0;
  printf("{\"warmup_ms\":[");
  for(int i=0;i<warm;i++){ double a=now_ms(); c=simulate(n,steps); printf("%s%.4f", i?",":"", now_ms()-a); }
  printf("],\"checksum\":%.17g,\"exec_ms\":[",c);
  for(int i=0;i<runs;i++){ double a=now_ms(); c=simulate(n,steps); printf("%s%.4f", i?",":"", now_ms()-a); }
  printf("]}\n"); return 0;
}
