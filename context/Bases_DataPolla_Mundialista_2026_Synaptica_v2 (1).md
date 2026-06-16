**DataPolla Mundialista 2026**

*Bases del torneo interno de predicción analítica — Synaptica S.A.S.*

# 1\. Objetivo y espíritu

La DataPolla es una actividad de integración y cultura analítica. No es una apuesta: nadie pone dinero. Synaptica entrega los premios como reconocimiento al mejor uso de datos y modelos para predecir los resultados de la fase eliminatoria del Mundial 2026.

**Tiempo acotado por diseño:** es una actividad voluntaria y ligera. La dedicación sugerida es de máximo 2 a 3 horas por semana, fuera de compromisos con clientes. La calidad de las ideas vale más que las horas invertidas, y la rúbrica del jurado lo refleja.

# 2\. Equipos e inscripción

-   Se participa de forma **individual o en dupla (2 personas)**. Las duplas idealmente combinan perfiles de ingeniería de datos y ciencia de datos, igual que en un proyecto real, pero cualquier combinación es válida. Participar solo también está permitido.
-   Cada equipo (individual o dupla) se inscribe con un nombre en el canal de Teams de la actividad.
-   **Cierre de inscripciones: miércoles 24 de junio de 2026.** Si alguien no encuentra pareja, puede participar individualmente o la organización arma las duplas restantes.

# 3\. Fases y calendario

## Fase de preparación (ya en curso — hasta el 27 de junio)

La fase de grupos del Mundial (11 al 27 de junio) es el set de entrenamiento principal. Cada equipo puede utilizar toda la data histórica disponible de mundiales anteriores, más los resultados de la fase de grupos de este Mundial 2026 a medida que se van disputando, para preparar sus datos, construir y calibrar su modelo, y validarlo contra resultados reales. No hay entregables obligatorios en esta fase.

## Torneo oficial (fase eliminatoria)

La competencia puntúa únicamente los partidos de eliminación directa:

**Ronda**

**Fechas**

**Cierre de predicciones**

Dieciseisavos de final

28 jun – 3 jul

28 jun, 1 hora antes del primer partido

Octavos de final

4 – 7 jul

4 jul, 1 hora antes del primer partido

Cuartos de final

9 – 11 jul

9 jul, 1 hora antes del primer partido

Semifinales

14 – 15 jul

14 jul, 1 hora antes del primer partido

Tercer lugar y Final

18 – 19 jul

18 jul, 1 hora antes del partido por el 3er lugar

Las predicciones se entregan **ronda por ronda**: al cerrar cada ronda se conocen los cruces de la siguiente y las duplas pueden (y deben) recalibrar su modelo con los datos más recientes. Predicción no entregada a tiempo = 0 puntos en esa ronda.

# 4\. Qué se predice y cómo se puntúa (Pista Precisión)

Por cada partido de la ronda, la dupla entrega: marcador en 90 minutos y equipo que avanza (clasificado, incluyendo prórroga/penales).

**Concepto**

**Puntos**

**Notas**

Marcador exacto en 90 minutos

5

Incluye los 3 puntos del resultado

Resultado en 90 minutos (victoria/empate)

3

Sin acertar el marcador exacto

Equipo que avanza de ronda

2

Se suma al puntaje del marcador

Bonus: campeón declarado antes de dieciseisavos

10

Una sola declaración, no editable

Bonus: finalistas declarados antes de dieciseisavos

5 c/u

Una sola declaración, no editable

Gana la **Pista Precisión** la dupla con más puntos acumulados al final del torneo. En caso de empate, decide el mayor número de marcadores exactos; si persiste, el mayor puntaje en la ronda final.

# 5\. Pista Analítica (innovación)

Para optar a este premio, la dupla entrega **un solo documento de máximo 1 página (model card)** antes de la final (fecha límite: 17 de julio), describiendo:

-   Fuentes de datos utilizadas y cómo se prepararon.
-   Enfoque del modelo (Elo, Poisson, ML, simulación Monte Carlo, LLM/agentes, ensamble, etc.).
-   Supuestos, limitaciones y cómo se recalibró ronda a ronda.
-   Opcional: enlace a repositorio, notebook o dashboard.

El jurado califica con esta rúbrica (100 puntos):

**Criterio**

**Peso**

**Qué se evalúa**

Rigor analítico

30

Metodología sólida y bien justificada

Creatividad e innovación

30

Enfoque original, uso ingenioso de datos o técnicas

Reproducibilidad

20

Otro equipo podría replicarlo con lo documentado

Comunicación y storytelling

20

Claridad del model card y/o visualizaciones

El desempeño predictivo NO pondera en esta pista: puede ganar un modelo elegante que no acertó la final. Se premia el pensamiento analítico, no la suerte.

# 6\. Premios (por definir)

**Reconocimiento**

**Premio**

1er lugar — Pista Precisión

Por definir (sugerido: bono de capacitación o día libre por integrante)

1er lugar — Pista Analítica

Por definir (sugerido: bono de capacitación o día libre por integrante)

2dos lugares (ambas pistas)

Por definir (sugerido: gift card o medio día libre)

3ros lugares (ambas pistas)

Por definir (sugerido: detalle/merch Synaptica)

Mención: mejor visualización

Reconocimiento en el showcase

Mención: “cisne negro” (acierto más improbable)

Reconocimiento en el showcase

Una misma dupla puede ganar en ambas pistas. Los premios son un incentivo de Synaptica, no producto de apuestas entre participantes.

# 7\. Logística

-   **Entrega de predicciones:** Microsoft Forms (una plantilla por ronda), con corte automático al deadline.
-   **Leaderboard:** dashboard en Power BI / Microsoft Fabric, actualizado al cierre de cada ronda y publicado en el canal de Teams.
-   **Repositorio:** carpeta de SharePoint del torneo para model cards y material de los equipos.
-   **Showcase de cierre:** sesión de 1 hora (semana del 20 de julio) donde los finalistas de la Pista Analítica presentan su modelo en 5 minutos, se premian las duplas ganadoras y se vota la mención del público.

# 8\. Reglas de juego limpio

-   Vale todo enfoque analítico: desde Excel hasta modelos de ML o LLMs. Lo importante es documentar qué se hizo.
-   Las predicciones quedan congeladas al cierre de cada ronda; no se editan después del deadline.
-   Está permitido (y se valora) usar datos públicos: rankings FIFA/Elo, datasets de Kaggle, StatsBomb open data, APIs de fútbol, probabilidades implícitas de mercado como benchmark.
-   La actividad es voluntaria y no debe interferir con compromisos de clientes ni proyectos en curso.
-   El jurado está conformado por la organización (CAO + 1-2 seniors que no participen). Sus decisiones en la Pista Analítica son inapelables.

*Que gane el mejor modelo. ¡A entrenar con la fase de grupos!*