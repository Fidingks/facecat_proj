import sympy as sp

# 定义符号变量
x, t, l, a, n = sp.symbols('x t l a n')
X = sp.Function('X')(x)  # X(x): 空间部分解
T = sp.Function('T')(t)  # T(t): 时间部分解
u = X * T  # u(x, t): 总解形式

# 热传导方程分离变量后得到的两个 ODE
# 时间部分
lambda_ = sp.symbols('lambda')  # 分离变量常数
T_eq = sp.Eq(T.diff(t), -lambda_ * T)

# 空间部分
mu = sp.sqrt(lambda_) / a
X_eq = sp.Eq(X.diff(x, 2), -mu**2 * X)

# 求解时间部分的 ODE
T_sol = sp.dsolve(T_eq, T)
print("时间部分解:")
sp.pprint(T_sol, use_unicode=True)

# 求解空间部分的 ODE
X_sol = sp.dsolve(X_eq, X)
print("\n空间部分解:")
sp.pprint(X_sol, use_unicode=True)

# 空间部分通解需要结合边界条件求解特征值
# 边界条件：u_x(0, t) = 0 和 u_x(l, t) = 0
X_func = X_sol.rhs
C2, C3 = sp.symbols('C2 C3')  # 解中未知系数
X_func = X_func.subs({C2: 1, C3: 1})  # 示例使用
print("\n特征解 X(x):")
sp.pprint(X_func, use_unicode=True)
