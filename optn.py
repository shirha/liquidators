import numpy as np
from scipy.optimize import minimize
from scipy.optimize import fsolve

# Given points
P0 = np.array([0, 0, 0])
P1 = np.array([105, 0, 0])

# Given distances
D04 = 33
D14 = 76
D24 = 269

# Fixed z4 value (e.g., -5)
z4_fixed = -4 # -1 makes p2z better but labels p0 and p4 cover each other

# Function to determine P4 (x4 and y4) with fixed z4
def equations_P4_xy(p):
    x4, y4 = p
    eq1 = x4**2 + y4**2 + z4_fixed**2 - D04**2  # Sphere centered at P0
    eq2 = (x4 - P1[0])**2 + y4**2 + z4_fixed**2 - D14**2  # Sphere centered at P1
    return (eq1, eq2)

# Initial guess for P4 (x4, y4)
initial_guess_P4_xy = np.array([30, 10])

# Solve for P4 (x4, y4) with fixed z4
P4_xy_solution = fsolve(equations_P4_xy, initial_guess_P4_xy)

# Combine the solution with the fixed z4 value
P4 = np.array([P4_xy_solution[0], P4_xy_solution[1], z4_fixed])
P4 = np.round(P4, 2)
print(f"Calculated coordinates for P4 with z4 fixed at {z4_fixed}: [{', '.join(f'{i:.2f}' for i in P4)}]")

# Given distances p0, p1, p4 to p2,3,5
D = {
  'P2': [259, 255, 269], # D02,D12,D24
  'P3': [360, 373, 370], # D03,D13,D34
  'P5': [235, 187, 225]  # D05,D15,D45
}

# Function to minimize: squared difference from the given distances
def objective(P):
    x, y, z = P
    dist_0_P = np.linalg.norm(np.array([x, y, z]) - P0) - D[n][0]
    dist_1_P = np.linalg.norm(np.array([x, y, z]) - P1) - D[n][1]
    dist_4_P = np.linalg.norm(np.array([x, y, z]) - P4) - D[n][2]
    return dist_0_P**2 + dist_1_P**2 + dist_4_P**2

for i in range(3):
  n = ['P2','P3','P5'][i]

  # Initial guess for P5
  initial_guess = np.array([50, 100, -150])

  # Minimize the objective function
  result = minimize(objective, initial_guess, method='L-BFGS-B')

  # Extract the solution
  P_solution = result.x

  print(f"{n} coordinates: x={P_solution[0]:.2f}, y={P_solution[1]:.2f}, z={P_solution[2]:.2f}")

  # Verification
  dist_0_P = np.linalg.norm(P_solution - P0)
  dist_1_P = np.linalg.norm(P_solution - P1)
  dist_4_P = np.linalg.norm(P_solution - P4)

  print(f"Verified distances: D0={dist_0_P:.2f}, D1={dist_1_P:.2f}, D4={dist_4_P:.2f} D={D[n]}")

'''
Calculated coordinates for P4 with z4 fixed at -4: [30.18, 12.73, -4.00]
P2 coordinates: x=63.77, y=-240.50, z=75.57
Verified distances: D0=260.03, D1=255.44, D4=267.55 D=[259, 255, 269]
P3 coordinates: x=7.12, y=-315.36, z=-173.49
Verified distances: D0=360.00, D1=373.00, D4=370.00 D=[360, 373, 370]
P5 coordinates: x=148.96, y=-157.96, z=-89.93
Verified distances: D0=235.00, D1=187.00, D4=225.00 D=[235, 187, 225]

Calculated coordinates for P4 with z4 fixed at -1: [30.18, 13.31, -1.00]
P2 coordinates: x=63.76, y=-251.38, z=18.89
Verified distances: D0=260.03, D1=255.44, D4=267.55 D=[259, 255, 269]
P3 coordinates: x=7.12, y=-267.56, z=-240.75
Verified distances: D0=360.00, D1=373.00, D4=370.00 D=[360, 373, 370]
P5 coordinates: x=148.96, y=-133.33, z=-123.54
Verified distances: D0=235.00, D1=187.00, D4=225.00 D=[235, 187, 225]

D01 105 ly
D02 259 ly
D03 360 ly
D04  33 ly
D05 235 ly

D12 255 ly
D13 373 ly
D14  76 ly
D15 187 ly

D23 251 ly
D24 269 ly
D25 201 ly

D34 370 ly
D35 229 ly

D45 225 ly
'''


