#!/usr/bin/env python3
# generate_report.py
# Genera CSV y PNG comparando docker stats before/after/final.
# Uso: python3 generate_report.py <remote_evidence_dir>

import sys
import os
import csv
import matplotlib.pyplot as plt

def parse_docker_stats_file(path):
    # formato esperado: name,CPUPerc,MEMUsage (e.g. "hiafinal_app,0.05%,10MiB / 1GiB")
    data = {}
    if not os.path.isfile(path):
        return data
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line=line.strip()
            if not line:
                continue
            parts=line.split(',',2)
            if len(parts) < 3:
                continue
            name=parts[0]
            cpu=parts[1].strip().rstrip('%')
            mem=parts[2].strip().split(' / ')[0]
            try:
                cpu_val=float(cpu)
            except:
                cpu_val=0.0
            data[name]={'cpu':cpu_val,'mem':mem}
    return data

def write_csv(outdir, before, after, final):
    csv_path=os.path.join(outdir,'docker_stats_comparison.csv')
    names=set(list(before.keys())+list(after.keys())+list(final.keys()))
    with open(csv_path,'w',newline='',encoding='utf-8') as csvf:
        writer=csv.writer(csvf)
        writer.writerow(['container','cpu_before','cpu_after','cpu_final','mem_before','mem_after','mem_final'])
        for n in sorted(names):
            b=before.get(n,{}); a=after.get(n,{}); f=final.get(n,{})
            writer.writerow([n, b.get('cpu',''), a.get('cpu',''), f.get('cpu',''), b.get('mem',''), a.get('mem',''), f.get('mem','')])
    return csv_path

def plot_cpu(outdir, csv_path):
    import pandas as pd
    df=pd.read_csv(csv_path)
    df=df.sort_values('container')
    containers=df['container'].tolist()
    before=df['cpu_before'].fillna(0).tolist()
    after=df['cpu_after'].fillna(0).tolist()
    final=df['cpu_final'].fillna(0).tolist()

    x = range(len(containers))
    width=0.25

    plt.figure(figsize=(10,6))
    plt.bar([p - width for p in x], before, width=width, label='before')
    plt.bar(x, after, width=width, label='after')
    plt.bar([p + width for p in x], final, width=width, label='final')
    plt.xticks(x, containers, rotation=45, ha='right')
    plt.ylabel('CPU %')
    plt.title('Docker containers CPU% before/after/final')
    plt.legend()
    plt.tight_layout()
    img_path=os.path.join(outdir,'docker_cpu_comparison.png')
    plt.savefig(img_path)
    print('Saved', img_path)

def main():
    if len(sys.argv) < 2:
        print('Usage: generate_report.py <remote_evidence_dir>')
        sys.exit(1)
    evidence_dir=sys.argv[1]
    # try common filenames
    before=os.path.join(evidence_dir,'docker_stats_before.txt')
    after=os.path.join(evidence_dir,'docker_stats_after.txt')
    final=os.path.join(evidence_dir,'docker_stats_final.txt')
    b=parse_docker_stats_file(before)
    a=parse_docker_stats_file(after)
    f=parse_docker_stats_file(final)
    outdir=evidence_dir
    csv_path=write_csv(outdir,b,a,f)
    print('Wrote CSV:', csv_path)
    try:
        plot_cpu(outdir,csv_path)
    except Exception as e:
        print('Plotting failed:', e)

if __name__=='__main__':
    main()
