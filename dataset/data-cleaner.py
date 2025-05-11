import pandas as pd
import os

file_csv = [os.path.join("dataset", f) for f in os.listdir("dataset") if f.endswith('.csv')]

column_to_keep = ["Giorno", "Postazione", "Strada", "Transiti - Totale"]

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

df_joint = df_joint[df_joint["Transiti - Totale"] != 0]

df_joint.to_csv("traffic-dataset.csv", index=False)