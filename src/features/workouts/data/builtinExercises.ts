import type { Exercise, ExerciseId } from '../domain/exercise';

// Original ChebuFit technique copy. Static built-in data; no user history or remote API.
export const builtinExercises: readonly Exercise[] = [
  {
    "id": "barbell-bench-press" as ExerciseId,
    "media": { "illustrationAssetKey": "barbell-bench-press" },
    "content": {
      "ru": {
        "name": "Жим штанги лёжа",
        "instructions": [
          "Лягте на скамью, поставьте стопы на пол и сведите лопатки.",
          "Возьмитесь за гриф чуть шире плеч и снимите его со стоек.",
          "Плавно опустите штангу к нижней части груди, удерживая предплечья под грифом.",
          "Выжмите штангу вверх, сохраняя опору стоп и положение лопаток."
        ],
        "tips": [
          "Не отбивайте гриф от груди."
        ]
      }
    },
    "aliases": [
      "Barbell Bench Press",
      "bench press",
      "жим лёжа"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ]
  },
  {
    "id": "incline-barbell-bench-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим штанги на наклонной скамье",
        "instructions": [
          "Установите небольшой наклон спинки и плотно обопритесь на неё.",
          "Снимите штангу со стоек хватом чуть шире плеч.",
          "Плавно опустите гриф к верхней части груди, сохраняя опору лопаток.",
          "Выжмите штангу вверх без отрыва таза от скамьи."
        ]
      }
    },
    "aliases": [
      "Incline Barbell Bench Press"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ]
  },
  {
    "id": "dumbbell-bench-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим гантелей лёжа",
        "instructions": [
          "Лягте на скамью и удерживайте гантели над грудью.",
          "Поставьте стопы на пол и соберите лопатки.",
          "Опустите гантели по сторонам груди в комфортной амплитуде.",
          "Выжмите их вверх, удерживая кисти над предплечьями."
        ]
      }
    },
    "aliases": [
      "Dumbbell Bench Press"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ]
  },
  {
    "id": "incline-dumbbell-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим гантелей на наклонной скамье",
        "instructions": [
          "Сядьте на скамью с небольшим наклоном и прижмите спину к опоре.",
          "Поднимите гантели к плечам, затем выведите над грудью.",
          "Плавно опустите гантели, не разводя локти строго в стороны.",
          "Выжмите гантели вверх, сохраняя устойчивое положение корпуса."
        ]
      }
    },
    "aliases": [
      "Incline Dumbbell Press"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ]
  },
  {
    "id": "dumbbell-fly" as ExerciseId,
    "content": {
      "ru": {
        "name": "Разведение гантелей лёжа",
        "instructions": [
          "Лягте на скамью и удерживайте гантели над грудью.",
          "Слегка согните локти и зафиксируйте этот угол.",
          "Разведите руки по дуге до комфортного растяжения грудных мышц.",
          "Сведите гантели по той же дуге без удара друг о друга."
        ],
        "tips": [
          "Не превращайте движение в жим."
        ]
      }
    },
    "aliases": [
      "Dumbbell Fly"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "shoulders"
    ]
  },
  {
    "id": "cable-fly" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сведение рук в кроссовере",
        "instructions": [
          "Возьмите рукояти блоков примерно на уровне плеч и сделайте шаг вперёд.",
          "Займите устойчивую стойку и слегка согните локти.",
          "Сведите руки перед грудью по плавной дуге.",
          "Верните рукояти назад, сохраняя угол в локтях и контроль движения."
        ]
      }
    },
    "aliases": [
      "Cable Fly",
      "кроссовер"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "shoulders"
    ]
  },
  {
    "id": "machine-chest-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим от груди в тренажёре",
        "instructions": [
          "Настройте сиденье так, чтобы рукояти находились примерно на уровне середины груди.",
          "Прижмите спину к опоре и поставьте стопы на пол.",
          "Выжмите рукояти вперёд, не поднимая плечи.",
          "Плавно верните рукояти, не бросая вес."
        ]
      }
    },
    "aliases": [
      "Chest Press Machine"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ]
  },
  {
    "id": "push-up" as ExerciseId,
    "content": {
      "ru": {
        "name": "Отжимания",
        "instructions": [
          "Поставьте ладони чуть шире плеч и вытяните корпус в прямую линию.",
          "Опуститесь, сгибая локти по диагонали назад.",
          "Приблизьте грудь к полу в доступной амплитуде.",
          "Оттолкнитесь от пола, сохраняя корпус собранным."
        ]
      }
    },
    "aliases": [
      "Push-Up",
      "push up",
      "отжимание"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "reps",
    "secondaryMuscles": [
      "triceps",
      "shoulders",
      "abs"
    ]
  },
  {
    "id": "pull-up" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подтягивания",
        "instructions": [
          "Возьмитесь за перекладину хватом немного шире плеч.",
          "Соберите корпус и начните движение опусканием плеч.",
          "Подтянитесь, направляя локти вниз и приближая верх груди к перекладине.",
          "Плавно опуститесь в исходное положение без раскачивания."
        ]
      }
    },
    "aliases": [
      "Pull-Up",
      "pull up"
    ],
    "primaryMuscles": [
      "back"
    ],
    "equipment": [
      "bodyweight",
      "pullupBar"
    ],
    "trackingType": "reps",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ]
  },
  {
    "id": "lat-pulldown" as ExerciseId,
    "content": {
      "ru": {
        "name": "Тяга верхнего блока",
        "instructions": [
          "Настройте упор для бёдер и возьмите рукоять чуть шире плеч.",
          "Сядьте устойчиво и слегка отклоните корпус назад.",
          "Подтяните рукоять к верхней части груди, направляя локти вниз.",
          "Верните рукоять вверх под контролем, не раскачивая корпус."
        ]
      }
    },
    "aliases": [
      "Lat Pulldown"
    ],
    "primaryMuscles": [
      "back"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ]
  },
  {
    "id": "barbell-row" as ExerciseId,
    "content": {
      "ru": {
        "name": "Тяга штанги в наклоне",
        "instructions": [
          "Возьмите штангу и наклонитесь от тазобедренных суставов, слегка согнув колени.",
          "Удерживайте спину в нейтральном положении и соберите живот.",
          "Подтяните гриф к нижней части живота, направляя локти назад.",
          "Опустите штангу, сохраняя наклон корпуса."
        ],
        "tips": [
          "Выбирайте вес, с которым не приходится выпрямляться на каждом повторе."
        ]
      }
    },
    "aliases": [
      "Barbell Row"
    ],
    "primaryMuscles": [
      "back"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "biceps",
      "lowerBack",
      "forearms"
    ]
  },
  {
    "id": "dumbbell-row" as ExerciseId,
    "content": {
      "ru": {
        "name": "Тяга гантели одной рукой",
        "instructions": [
          "Упритесь свободной рукой в скамью и займите устойчивое положение.",
          "Удерживайте гантель в опущенной руке, сохраняя ровный корпус.",
          "Подтяните гантель к тазу, направляя локоть назад.",
          "Плавно опустите её и выполните движение другой стороной."
        ],
        "tips": [
          "Не разворачивайте корпус вслед за гантелью."
        ]
      }
    },
    "aliases": [
      "Dumbbell Row"
    ],
    "primaryMuscles": [
      "back"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ]
  },
  {
    "id": "seated-cable-row" as ExerciseId,
    "content": {
      "ru": {
        "name": "Тяга горизонтального блока",
        "instructions": [
          "Сядьте к блоку, упритесь стопами и возьмите рукоять.",
          "Выпрямите корпус, оставив колени слегка согнутыми.",
          "Подтяните рукоять к животу, направляя локти назад.",
          "Выпрямите руки под контролем без сильного наклона вперёд."
        ]
      }
    },
    "aliases": [
      "Seated Cable Row"
    ],
    "primaryMuscles": [
      "back"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "biceps",
      "forearms"
    ]
  },
  {
    "id": "chest-supported-row" as ExerciseId,
    "content": {
      "ru": {
        "name": "Тяга гантелей с упором грудью",
        "instructions": [
          "Настройте наклонную скамью и лягте грудью на спинку.",
          "Поставьте стопы устойчиво и опустите гантели вниз.",
          "Подтяните гантели к бокам, направляя локти назад.",
          "Плавно опустите руки, не отрывая грудь от опоры."
        ]
      }
    },
    "aliases": [
      "Chest-Supported Dumbbell Row"
    ],
    "primaryMuscles": [
      "back"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "biceps",
      "shoulders"
    ]
  },
  {
    "id": "barbell-overhead-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим штанги стоя",
        "instructions": [
          "Встаньте устойчиво и удерживайте гриф перед плечами.",
          "Напрягите живот и ягодицы, сохраняя нейтральное положение поясницы.",
          "Выжмите гриф над головой, слегка убрав подбородок с его пути.",
          "Опустите штангу к плечам под контролем."
        ]
      }
    },
    "aliases": [
      "Overhead Press",
      "military press",
      "армейский жим"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "triceps",
      "abs"
    ]
  },
  {
    "id": "dumbbell-shoulder-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим гантелей сидя",
        "instructions": [
          "Сядьте на скамью с высокой спинкой и поставьте стопы на пол.",
          "Поднимите гантели к плечам, удерживая предплечья почти вертикально.",
          "Выжмите гантели вверх без сильного прогиба в пояснице.",
          "Плавно опустите их к исходному положению."
        ]
      }
    },
    "aliases": [
      "Dumbbell Shoulder Press"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "triceps"
    ]
  },
  {
    "id": "dumbbell-lateral-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём гантелей через стороны",
        "instructions": [
          "Встаньте ровно и удерживайте гантели по бокам.",
          "Слегка согните локти и опустите плечи.",
          "Поднимите руки в стороны примерно до уровня плеч.",
          "Плавно опустите гантели без раскачивания корпуса."
        ],
        "tips": [
          "Ведите движение локтями и не пожимайте плечами."
        ]
      }
    },
    "aliases": [
      "Lateral Raise",
      "махи гантелями в стороны"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "equipment": [
      "dumbbell"
    ],
    "trackingType": "weightReps"
  },
  {
    "id": "rear-delt-fly" as ExerciseId,
    "content": {
      "ru": {
        "name": "Разведение гантелей в наклоне",
        "instructions": [
          "Наклонитесь от тазобедренных суставов и слегка согните колени.",
          "Опустите гантели перед собой, сохраняя нейтральную спину.",
          "Разведите слегка согнутые руки в стороны.",
          "Верните гантели вниз, не меняя наклон корпуса."
        ]
      }
    },
    "aliases": [
      "Rear Delt Fly",
      "reverse fly",
      "задняя дельта"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "equipment": [
      "dumbbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "back"
    ]
  },
  {
    "id": "face-pull" as ExerciseId,
    "content": {
      "ru": {
        "name": "Тяга каната к лицу",
        "instructions": [
          "Закрепите канат примерно на уровне лица и отойдите от блока.",
          "Займите устойчивую стойку с вытянутыми вперёд руками.",
          "Потяните канат к лицу, разводя кисти и локти в стороны.",
          "Плавно выпрямите руки, сохраняя корпус неподвижным."
        ]
      }
    },
    "aliases": [
      "Face Pull"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "back"
    ]
  },
  {
    "id": "barbell-back-squat" as ExerciseId,
    "media": { "illustrationAssetKey": "barbell-back-squat" },
    "content": {
      "ru": {
        "name": "Приседания со штангой",
        "instructions": [
          "Расположите гриф на верхней части спины и снимите со стоек.",
          "Поставьте стопы в удобную устойчивую стойку и соберите корпус.",
          "Согните колени и тазобедренные суставы, опускаясь на контролируемую глубину.",
          "Встаньте, опираясь на всю стопу и сохраняя направление коленей по линии носков."
        ]
      }
    },
    "aliases": [
      "Barbell Back Squat",
      "back squat",
      "squat"
    ],
    "primaryMuscles": [
      "quadriceps",
      "glutes"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "hamstrings",
      "lowerBack",
      "abs"
    ]
  },
  {
    "id": "leg-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим ногами",
        "instructions": [
          "Настройте сиденье и поставьте стопы на платформу примерно на ширине плеч.",
          "Снимите ограничители и удерживайте таз и спину на опоре.",
          "Опустите платформу до глубины, на которой таз остаётся прижатым.",
          "Выжмите платформу, не выпрямляя колени резким толчком."
        ]
      }
    },
    "aliases": [
      "Leg Press"
    ],
    "primaryMuscles": [
      "quadriceps",
      "glutes"
    ],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "hamstrings"
    ]
  },
  {
    "id": "romanian-deadlift" as ExerciseId,
    "content": {
      "ru": {
        "name": "Румынская тяга",
        "instructions": [
          "Встаньте со штангой перед бёдрами и слегка согните колени.",
          "Отводите таз назад, ведя гриф близко к ногам.",
          "Опускайте вес до доступного натяжения задней поверхности бедра, сохраняя нейтральную спину.",
          "Верните таз вперёд и выпрямитесь без отклонения корпуса назад."
        ]
      }
    },
    "aliases": [
      "Romanian Deadlift",
      "rdl"
    ],
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "lowerBack",
      "forearms"
    ]
  },
  {
    "id": "leg-extension" as ExerciseId,
    "content": {
      "ru": {
        "name": "Разгибание ног в тренажёре",
        "instructions": [
          "Настройте спинку и валик так, чтобы колени совпадали с осью тренажёра.",
          "Прижмите спину к опоре и возьмитесь за рукояти.",
          "Разогните ноги плавным движением.",
          "Опустите валик под контролем, не бросая вес."
        ]
      }
    },
    "aliases": [
      "Leg Extension"
    ],
    "primaryMuscles": [
      "quadriceps"
    ],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps"
  },
  {
    "id": "leg-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сгибание ног в тренажёре",
        "instructions": [
          "Настройте тренажёр так, чтобы колени совпадали с его осью, а валик находился над пятками.",
          "Зафиксируйте корпус на опоре и возьмитесь за рукояти.",
          "Согните колени, подтягивая валик к себе.",
          "Плавно верните ноги в исходное положение."
        ]
      }
    },
    "aliases": [
      "Leg Curl"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps"
  },
  {
    "id": "bulgarian-split-squat" as ExerciseId,
    "content": {
      "ru": {
        "name": "Болгарские сплит-приседания с гантелями",
        "instructions": [
          "Встаньте спиной к скамье, удерживая гантели по бокам.",
          "Положите заднюю стопу на скамью и найдите устойчивую дистанцию.",
          "Опуститесь вниз, сгибая переднюю ногу и сохраняя опору всей стопой.",
          "Поднимитесь усилием передней ноги и затем смените сторону."
        ]
      }
    },
    "aliases": [
      "Bulgarian Split Squat",
      "болгарские выпады"
    ],
    "primaryMuscles": [
      "quadriceps",
      "glutes"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "hamstrings"
    ]
  },
  {
    "id": "walking-lunge" as ExerciseId,
    "content": {
      "ru": {
        "name": "Выпады в ходьбе с гантелями",
        "instructions": [
          "Встаньте ровно, удерживая гантели по бокам.",
          "Сделайте шаг вперёд и опустите заднее колено к полу.",
          "Сохраняйте устойчивую переднюю стопу и ровный корпус.",
          "Оттолкнитесь передней ногой и перейдите в выпад другой ногой."
        ]
      }
    },
    "aliases": [
      "Walking Lunge"
    ],
    "primaryMuscles": [
      "quadriceps",
      "glutes"
    ],
    "equipment": [
      "dumbbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "hamstrings"
    ]
  },
  {
    "id": "standing-calf-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём на носки стоя в тренажёре",
        "instructions": [
          "Настройте плечевые упоры и поставьте переднюю часть стоп на платформу.",
          "Удерживайте колени слегка смягчёнными и корпус ровным.",
          "Поднимите пятки вверх до сокращения икр.",
          "Плавно опустите пятки в комфортную амплитуду."
        ],
        "tips": [
          "Не пружиньте в нижней точке."
        ]
      }
    },
    "aliases": [
      "Standing Calf Raise"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps"
  },
  {
    "id": "barbell-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сгибание рук со штангой",
        "instructions": [
          "Возьмите гриф снизу и встаньте устойчиво.",
          "Расположите локти рядом с корпусом.",
          "Согните руки, поднимая штангу без отклонения корпуса назад.",
          "Плавно опустите гриф, сохраняя положение локтей."
        ]
      }
    },
    "aliases": [
      "Barbell Curl"
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "forearms"
    ]
  },
  {
    "id": "dumbbell-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сгибание рук с гантелями",
        "instructions": [
          "Встаньте с гантелями по бокам, развернув ладони вперёд.",
          "Удерживайте локти возле корпуса и опустите плечи.",
          "Согните руки, поднимая гантели к плечам.",
          "Опустите гантели под контролем без раскачивания."
        ]
      }
    },
    "aliases": [
      "Dumbbell Curl"
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "dumbbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "forearms"
    ]
  },
  {
    "id": "hammer-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Молотковые сгибания",
        "instructions": [
          "Встаньте ровно и удерживайте гантели ладонями к корпусу.",
          "Сохраняйте локти рядом с боками.",
          "Согните руки, не разворачивая кисти.",
          "Плавно опустите гантели в исходное положение."
        ]
      }
    },
    "aliases": [
      "Hammer Curl",
      "молотки"
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "dumbbell"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "forearms"
    ]
  },
  {
    "id": "triceps-pushdown" as ExerciseId,
    "content": {
      "ru": {
        "name": "Разгибание рук на блоке",
        "instructions": [
          "Закрепите рукоять на верхнем блоке и займите устойчивую стойку.",
          "Прижмите локти к бокам, согнув руки перед собой.",
          "Разогните локти и опустите рукоять вниз.",
          "Плавно согните руки обратно, не двигая плечами."
        ]
      }
    },
    "aliases": [
      "Triceps Pushdown",
      "tricep pushdown"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps"
  },
  {
    "id": "overhead-triceps-extension" as ExerciseId,
    "content": {
      "ru": {
        "name": "Разгибание рук с гантелью из-за головы",
        "instructions": [
          "Удерживайте одну гантель двумя руками над головой.",
          "Соберите корпус и направьте локти вверх.",
          "Согните локти, опуская гантель за голову в комфортной амплитуде.",
          "Выпрямите руки, сохраняя плечи по возможности неподвижными."
        ]
      }
    },
    "aliases": [
      "Overhead Triceps Extension",
      "французский жим с гантелью"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "dumbbell"
    ],
    "trackingType": "weightReps"
  },
  {
    "id": "close-grip-bench-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим штанги лёжа узким хватом",
        "instructions": [
          "Лягте на скамью, поставьте стопы на пол и сведите лопатки.",
          "Возьмите гриф примерно на ширине плеч и снимите его со стоек.",
          "Опустите штангу к нижней части груди, удерживая локти ближе к корпусу.",
          "Выжмите гриф вверх без отрыва таза от скамьи."
        ],
        "tips": [
          "Не сужайте хват настолько, что кисти теряют устойчивое положение."
        ]
      }
    },
    "aliases": [
      "Close-Grip Bench Press"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ]
  },
  {
    "id": "plank" as ExerciseId,
    "media": { "illustrationAssetKey": "plank" },
    "content": {
      "ru": {
        "name": "Планка",
        "instructions": [
          "Поставьте предплечья на пол, расположив локти под плечами.",
          "Вытяните ноги и обопритесь на носки.",
          "Соберите живот и ягодицы, удерживая голову и корпус в одной линии.",
          "Сохраняйте положение с ровным дыханием в течение выбранного времени."
        ]
      }
    },
    "aliases": [
      "Plank"
    ],
    "primaryMuscles": [
      "abs"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "duration",
    "secondaryMuscles": [
      "glutes",
      "shoulders"
    ]
  },
  {
    "id": "cable-crunch" as ExerciseId,
    "content": {
      "ru": {
        "name": "Скручивания на блоке",
        "instructions": [
          "Возьмите канат верхнего блока и встаньте на колени лицом к тренажёру.",
          "Удерживайте рукоять около головы, не тяните её руками.",
          "Скрутите корпус, приближая рёбра к тазу.",
          "Плавно разверните корпус обратно, сохраняя положение таза."
        ]
      }
    },
    "aliases": [
      "Cable Crunch"
    ],
    "primaryMuscles": [
      "abs"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps"
  },
  {
    "id": "hanging-leg-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём ног в висе",
        "instructions": [
          "Повисните на перекладине и соберите плечевой пояс.",
          "Удерживайте корпус без раскачивания.",
          "Поднимите ноги, слегка подкручивая таз; при необходимости согните колени.",
          "Плавно опустите ноги и восстановите неподвижное положение."
        ]
      }
    },
    "aliases": [
      "Hanging Leg Raise"
    ],
    "primaryMuscles": [
      "abs"
    ],
    "equipment": [
      "bodyweight",
      "pullupBar"
    ],
    "trackingType": "reps",
    "secondaryMuscles": [
      "forearms"
    ]
  },
];
