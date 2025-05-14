import pandas as pd
import os

file_csv = [os.path.join("dataset", f) for f in os.listdir("dataset") if f.endswith('.csv')]

column_to_keep = ["Giorno", "N Giorno Settimana", "Postazione", "Strada", "Transiti - Totale"]

df_joint = pd.concat(
    [pd.read_csv(f, sep=';', quotechar='"', encoding='utf-8') for f in file_csv],
    ignore_index=True
)

df_joint = df_joint[column_to_keep]

df_joint["Transiti - Totale"] = (
    df_joint["Transiti - Totale"]
    .astype(str)
    .str.replace('.', '', regex=False)
    .replace('', pd.NA)
    .astype(float)
    .fillna(0)
    .astype(int)
)

df_joint["Postazione"] = (
    df_joint["Postazione"]
    .fillna(0)
    .astype(float)
    .astype(int)
)

df_joint["N Giorno Settimana"] = (
    df_joint["N Giorno Settimana"]
    .fillna(0)
    .astype(float)
    .astype(int)
)

df_joint = df_joint[df_joint["Transiti - Totale"] != 0]

df_joint["Giorno"] = pd.to_datetime(df_joint["Giorno"], dayfirst=True, errors="coerce")

postazioni_uniche = sorted(df_joint["Postazione"].unique())
metà = len(postazioni_uniche) // 2
postazioni_A = set(postazioni_uniche[:metà])
postazioni_B = set(postazioni_uniche[metà:])

df_A = df_joint[df_joint["Postazione"].isin(postazioni_A)]
df_B = df_joint[df_joint["Postazione"].isin(postazioni_B)]

df_A = df_A.sort_values(by=["Giorno", "Postazione"])
df_B = df_B.sort_values(by=["Giorno", "Postazione"])

df_A["Giorno"] = df_A["Giorno"].dt.strftime("%d/%m/%Y")
df_B["Giorno"] = df_B["Giorno"].dt.strftime("%d/%m/%Y")

df_A.to_csv(os.path.join("dataset", "traffic-dataset-half-A.csv"), index=False)
df_B.to_csv(os.path.join("dataset", "traffic-dataset-half-B.csv"), index=False)