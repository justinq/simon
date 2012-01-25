#!/usr/bin/python
import sys
from time import time
import os
import random
import cgi

MAXSIZE=250
DIRPREFIX="treefiles/"
DATADIR=DIRPREFIX+open(DIRPREFIX+"current_tree").readline().rstrip()

def levenshtein(s1, s2):
    if len(s1) < len(s2):
        return levenshtein(s2, s1)
    if not s1:
        return len(s2)
 
    previous_row = xrange(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
 
    return previous_row[-1]

def lev(a, b):
    if not a: return len(b)
    if not b: return len(a)
    return min(lev(a[1:], b[1:])+(a[0] != b[0]), lev(a[1:], b)+1, lev(a, b[1:])+1)

def levnorm(a, b):
   return levenshtein(a, b)/float(max(len(a),len(b)))

def randomsequence():
    x=['1','2','3','4','1','2','3','4','1','2','3','4']
    random.shuffle(x)
    seq=""
    for i in x:
        seq+=i
    return seq

def newtree(sequence):
    treename="data"+str(time())
    DATADIR=DIRPREFIX+treename
    os.mkdir(DATADIR)
    file=open(DATADIR+"/0","w")
    file.write('null\n')
    file.write('null\n')
    file.write(sequence)
    file.write('\n')
    file.write('1.0\n')
    file.write(cgi.escape(os.environ["REMOTE_ADDR"]))
    file.close()
    treefile=open(DIRPREFIX+"current_tree","w")
    treefile.write(treename)
    treefile.close()

print "Content-type: text/plain\n"

command=sys.argv[1].split(',')

if command[0]=="get":
   datasets=[f for f in os.listdir(DATADIR)]
   filename=random.choice(datasets)
   print filename
   file=open(DATADIR+"/"+filename,"r")
   file.readline()
   file.readline()
   print file.readline().rstrip()
   print file.readline()

if command[0]=="put":
   distance=levnorm(command[2],command[3])
   newlen=len(command[3])
   difference=float(newlen)/float(len(command[2]))
   if (newlen>5 and newlen<25 and difference<1.5 and difference>0.66):
       file=open(DATADIR+"/"+str(time()),"w")
       file.write(command[1])
       file.write('\n')
       file.write(command[2])
       file.write('\n')
       file.write(command[3])
       file.write('\n')
       file.write(str(distance))
       file.write('\n')
       file.write(cgi.escape(os.environ["REMOTE_ADDR"]))
   print distance

if command[0]=="tree":
   print DATADIR;
   datasets=[f for f in os.listdir(DATADIR)]
   datasets.sort()
   for f in datasets:
      file=open(DATADIR+"/"+f,"r")
      parent=file.readline().rstrip()
      file.readline()
      print parent+','+f+','+file.readline().rstrip()+','+file.readline().rstrip()+','+file.readline().rstrip()
      file.close()
   if len(datasets)>MAXSIZE:
       sequence=randomsequence();
       newtree(sequence)

if command[0]=="reset":
    newtree(command[1])
   
