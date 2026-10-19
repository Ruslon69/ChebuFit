import type { Exercise, ExerciseId } from '../domain/exercise';

// Approved v1 manifest: explicit permanent numbers, original ChebuFit copy, no artwork.
export const builtinExercises: readonly Exercise[] = [
  {
    "catalogNumber": "EX-001",
    "id": "barbell-bench-press" as ExerciseId,
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
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-001-barbell-bench-press"
    }
  },
  {
    "catalogNumber": "EX-002",
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
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-002-dumbbell-bench-press"
    }
  },
  {
    "catalogNumber": "EX-003",
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
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-003-incline-dumbbell-press"
    }
  },
  {
    "catalogNumber": "EX-004",
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
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-004-incline-barbell-bench-press"
    }
  },
  {
    "catalogNumber": "EX-005",
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
      "Cable Chest Fly",
      "cable fly",
      "Cable Fly",
      "кроссовер"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-005-cable-fly"
    }
  },
  {
    "catalogNumber": "EX-006",
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
      "Dumbbell Chest Fly",
      "dumbbell fly",
      "Dumbbell Fly"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-006-dumbbell-fly"
    }
  },
  {
    "catalogNumber": "EX-007",
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
    "secondaryMuscles": [
      "triceps",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-007-push-up"
    }
  },
  {
    "catalogNumber": "EX-008",
    "id": "chest-dip" as ExerciseId,
    "content": {
      "ru": {
        "name": "Отжимания на брусьях",
        "instructions": [
          "Возьмитесь за брусья и поднимитесь на прямые руки, удерживая плечи устойчиво.",
          "Слегка наклоните корпус вперёд и согните локти.",
          "Опуститесь до комфортной глубины без раскачивания.",
          "Выжмите себя вверх и вернитесь в устойчивое положение."
        ],
        "tips": [
          "Выбирайте глубину, при которой сохраняется контроль плеч."
        ]
      }
    },
    "aliases": [
      "Chest Dip",
      "parallel bar dip"
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "dipBars"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-008-chest-dip"
    }
  },
  {
    "catalogNumber": "EX-009",
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
    "secondaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "pullUpBar"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-009-pull-up"
    }
  },
  {
    "catalogNumber": "EX-010",
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
    "secondaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-010-lat-pulldown"
    }
  },
  {
    "catalogNumber": "EX-011",
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
      "Barbell Bent Over Row",
      "barbell row",
      "Barbell Row"
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "biceps",
      "rearShoulders"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-011-barbell-row"
    }
  },
  {
    "catalogNumber": "EX-012",
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
      "One Arm Dumbbell Row",
      "dumbbell row",
      "Dumbbell Row"
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-012-dumbbell-row"
    }
  },
  {
    "catalogNumber": "EX-013",
    "id": "seated-cable-row" as ExerciseId,
    "content": {
      "ru": {
        "name": "Горизонтальная тяга блока",
        "instructions": [
          "Сядьте к блоку, упритесь стопами и возьмите рукоять.",
          "Выпрямите корпус, оставив колени слегка согнутыми.",
          "Подтяните рукоять к животу, направляя локти назад.",
          "Выпрямите руки под контролем без сильного наклона вперёд."
        ]
      }
    },
    "aliases": [
      "Seated Cable Row",
      "Тяга горизонтального блока"
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "biceps",
      "rearShoulders"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-013-seated-cable-row"
    }
  },
  {
    "catalogNumber": "EX-014",
    "id": "t-bar-row" as ExerciseId,
    "content": {
      "ru": {
        "name": "Тяга Т-грифа",
        "instructions": [
          "Подготовьте Т-гриф в тренажёре или закреплённую штангу с подходящей рукоятью.",
          "Наклоните корпус, отведите таз назад и удерживайте спину нейтрально.",
          "Подтяните рукоять к корпусу, направляя локти назад.",
          "Плавно опустите вес, сохраняя угол корпуса."
        ],
        "tips": [
          "Для варианта со штангой используйте надёжное крепление её свободного конца."
        ]
      }
    },
    "aliases": [
      "T-Bar Row",
      "t bar row"
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "biceps",
      "rearShoulders"
    ],
    "equipment": [
      "machineOrBarbell"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-014-t-bar-row"
    }
  },
  {
    "catalogNumber": "EX-015",
    "id": "straight-arm-pulldown" as ExerciseId,
    "content": {
      "ru": {
        "name": "Пуловер на верхнем блоке",
        "instructions": [
          "Закрепите рукоять на верхнем блоке и отойдите на шаг.",
          "Слегка наклонитесь вперёд, оставляя небольшой сгиб в локтях.",
          "Опустите рукоять к бёдрам движением плеч, не сгибая руки сильнее.",
          "Подконтрольно верните рукоять вверх без прогиба в пояснице."
        ]
      }
    },
    "aliases": [
      "Straight Arm Pulldown",
      "cable pullover"
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-015-straight-arm-pulldown"
    }
  },
  {
    "catalogNumber": "EX-016",
    "id": "back-extension" as ExerciseId,
    "content": {
      "ru": {
        "name": "Гиперэкстензия",
        "instructions": [
          "Настройте опору скамьи ниже сгиба таза и закрепите стопы.",
          "Удерживая спину нейтрально, наклоните корпус за счёт сгибания в тазу.",
          "Поднимите корпус до линии с ногами.",
          "Плавно повторите движение без переразгибания поясницы."
        ]
      }
    },
    "aliases": [
      "Back Extension",
      "hyperextension"
    ],
    "primaryMuscles": [
      "lowerBack"
    ],
    "secondaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "equipment": [
      "bench"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-016-back-extension"
    }
  },
  {
    "catalogNumber": "EX-017",
    "id": "barbell-overhead-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим штанги над головой",
        "instructions": [
          "Встаньте устойчиво и удерживайте гриф перед плечами.",
          "Напрягите живот и ягодицы, сохраняя нейтральное положение поясницы.",
          "Выжмите гриф над головой, слегка убрав подбородок с его пути.",
          "Опустите штангу к плечам под контролем."
        ]
      }
    },
    "aliases": [
      "Barbell Overhead Press",
      "military press",
      "Overhead Press",
      "армейский жим",
      "Жим штанги стоя"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-017-barbell-overhead-press"
    }
  },
  {
    "catalogNumber": "EX-018",
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
      "Seated Dumbbell Shoulder Press",
      "dumbbell shoulder press",
      "Dumbbell Shoulder Press"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-018-dumbbell-shoulder-press"
    }
  },
  {
    "catalogNumber": "EX-019",
    "id": "arnold-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Жим Арнольда",
        "instructions": [
          "Сядьте на скамью с опорой спины и поднимите гантели перед плечами ладонями к себе.",
          "Начните жим вверх, плавно разворачивая ладони вперёд.",
          "Выпрямите руки над головой, не отрывая корпус от опоры.",
          "Опустите гантели и верните ладони к себе обратным движением."
        ]
      }
    },
    "aliases": [
      "Arnold Press"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-019-arnold-press"
    }
  },
  {
    "catalogNumber": "EX-020",
    "id": "dumbbell-lateral-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём гантелей в стороны",
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
      "Dumbbell Lateral Raise",
      "lateral raise",
      "Lateral Raise",
      "махи гантелями в стороны",
      "Подъём гантелей через стороны"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-020-dumbbell-lateral-raise"
    }
  },
  {
    "catalogNumber": "EX-021",
    "id": "dumbbell-front-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём гантелей перед собой",
        "instructions": [
          "Встаньте устойчиво, удерживая гантели перед бёдрами.",
          "Слегка согните локти и сохраните положение корпуса.",
          "Поднимите руки перед собой примерно до уровня плеч.",
          "Плавно опустите гантели, не раскачиваясь."
        ]
      }
    },
    "aliases": [
      "Dumbbell Front Raise",
      "front raise"
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-021-dumbbell-front-raise"
    }
  },
  {
    "catalogNumber": "EX-022",
    "id": "rear-delt-fly" as ExerciseId,
    "content": {
      "ru": {
        "name": "Обратное разведение гантелей",
        "instructions": [
          "Наклонитесь от тазобедренных суставов и слегка согните колени.",
          "Опустите гантели перед собой, сохраняя нейтральную спину.",
          "Разведите слегка согнутые руки в стороны.",
          "Верните гантели вниз, не меняя наклон корпуса."
        ]
      }
    },
    "aliases": [
      "Dumbbell Reverse Fly",
      "rear delt fly",
      "Rear Delt Fly",
      "reverse fly",
      "задняя дельта",
      "Разведение гантелей в наклоне"
    ],
    "primaryMuscles": [
      "rearShoulders"
    ],
    "secondaryMuscles": [
      "back"
    ],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-022-rear-delt-fly"
    }
  },
  {
    "catalogNumber": "EX-023",
    "id": "face-pull" as ExerciseId,
    "content": {
      "ru": {
        "name": "Face Pull",
        "instructions": [
          "Закрепите канат примерно на уровне лица и отойдите от блока.",
          "Займите устойчивую стойку с вытянутыми вперёд руками.",
          "Потяните канат к лицу, разводя кисти и локти в стороны.",
          "Плавно выпрямите руки, сохраняя корпус неподвижным."
        ]
      }
    },
    "aliases": [
      "Face Pull",
      "тяга каната к лицу",
      "Тяга каната к лицу"
    ],
    "primaryMuscles": [
      "rearShoulders"
    ],
    "secondaryMuscles": [
      "back"
    ],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-023-face-pull"
    }
  },
  {
    "catalogNumber": "EX-024",
    "id": "shrug" as ExerciseId,
    "content": {
      "ru": {
        "name": "Шраги",
        "instructions": [
          "Встаньте ровно, удерживая гантели по бокам.",
          "Оставьте руки прямыми и направьте взгляд вперёд.",
          "Поднимите плечи вверх без вращения и движения головы.",
          "Подконтрольно опустите плечи в исходное положение."
        ]
      }
    },
    "aliases": [
      "Shrug",
      "dumbbell shrug"
    ],
    "primaryMuscles": [
      "traps"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-024-shrug"
    }
  },
  {
    "catalogNumber": "EX-025",
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
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-025-barbell-curl"
    }
  },
  {
    "catalogNumber": "EX-026",
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
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-026-dumbbell-curl"
    }
  },
  {
    "catalogNumber": "EX-027",
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
    "secondaryMuscles": [
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-027-hammer-curl"
    }
  },
  {
    "catalogNumber": "EX-028",
    "id": "preacher-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сгибание рук на скамье Скотта",
        "instructions": [
          "Настройте скамью Скотта и положите плечи на подушку.",
          "Возьмите штангу или EZ-гриф удобным хватом.",
          "Согните локти, сохраняя плечи на опоре.",
          "Плавно опустите гриф без резкого выпрямления локтей."
        ]
      }
    },
    "aliases": [
      "Preacher Curl",
      "Scott curl"
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "barbellOrEzBar",
      "preacherBench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-028-preacher-curl"
    }
  },
  {
    "catalogNumber": "EX-029",
    "id": "cable-biceps-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сгибание рук на нижнем блоке",
        "instructions": [
          "Закрепите рукоять на нижнем блоке и встаньте лицом к нему.",
          "Возьмите рукоять ладонями вверх и оставьте локти у корпуса.",
          "Согните руки, не подавая плечи вперёд.",
          "Медленно верните рукоять вниз, сохраняя натяжение троса."
        ]
      }
    },
    "aliases": [
      "Cable Biceps Curl",
      "cable curl"
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-029-cable-biceps-curl"
    }
  },
  {
    "catalogNumber": "EX-030",
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
      "Cable Triceps Pushdown",
      "triceps pushdown",
      "Triceps Pushdown",
      "tricep pushdown"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-030-triceps-pushdown"
    }
  },
  {
    "catalogNumber": "EX-031",
    "id": "lying-triceps-extension" as ExerciseId,
    "content": {
      "ru": {
        "name": "Французский жим",
        "instructions": [
          "Лягте на скамью и поднимите штангу или EZ-гриф над плечами.",
          "Удерживая плечи устойчиво, согните локти и опустите гриф к области за головой.",
          "Разогните руки за счёт движения в локтях.",
          "Повторите подконтрольно, не меняя положение корпуса."
        ]
      }
    },
    "aliases": [
      "Lying Triceps Extension",
      "skull crusher",
      "French press"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "barbellOrEzBar",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-031-lying-triceps-extension"
    }
  },
  {
    "catalogNumber": "EX-032",
    "id": "overhead-triceps-extension" as ExerciseId,
    "content": {
      "ru": {
        "name": "Разгибание гантели из-за головы",
        "instructions": [
          "Удерживайте одну гантель двумя руками над головой.",
          "Соберите корпус и направьте локти вверх.",
          "Согните локти, опуская гантель за голову в комфортной амплитуде.",
          "Выпрямите руки, сохраняя плечи по возможности неподвижными."
        ]
      }
    },
    "aliases": [
      "Overhead Dumbbell Triceps Extension",
      "Overhead Triceps Extension",
      "французский жим с гантелью",
      "Разгибание рук с гантелью из-за головы"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-032-overhead-triceps-extension"
    }
  },
  {
    "catalogNumber": "EX-033",
    "id": "close-grip-bench-press" as ExerciseId,
    "content": {
      "ru": {
        "name": "Узкий жим штанги лёжа",
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
      "Close Grip Bench Press",
      "Close-Grip Bench Press",
      "Жим штанги лёжа узким хватом"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-033-close-grip-bench-press"
    }
  },
  {
    "catalogNumber": "EX-034",
    "id": "overhead-cable-triceps-extension" as ExerciseId,
    "content": {
      "ru": {
        "name": "Разгибание рук на блоке над головой",
        "instructions": [
          "Закрепите канат на блоке и встаньте спиной к нему.",
          "Поднимите руки над головой, сделайте шаг вперёд и найдите устойчивую стойку.",
          "Разогните локти, удерживая плечи на месте.",
          "Плавно согните руки и верните канат за голову."
        ]
      }
    },
    "aliases": [
      "Overhead Cable Triceps Extension"
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-034-overhead-cable-triceps-extension"
    }
  },
  {
    "catalogNumber": "EX-035",
    "id": "barbell-back-squat" as ExerciseId,
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
      "barbell squat",
      "squat"
    ],
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-035-barbell-back-squat"
    }
  },
  {
    "catalogNumber": "EX-036",
    "id": "barbell-front-squat" as ExerciseId,
    "content": {
      "ru": {
        "name": "Фронтальные приседания",
        "instructions": [
          "Установите штангу на стойках и расположите её на передней части плеч.",
          "Снимите штангу, отойдите и поставьте стопы в устойчивую позицию.",
          "Сядьте вниз, направляя колени по линии стоп и удерживая локти поднятыми.",
          "Поднимитесь, сохраняя опору всей стопой и устойчивое положение грифа."
        ],
        "tips": [
          "Выберите хват, который позволяет устойчиво держать гриф на плечах."
        ]
      }
    },
    "aliases": [
      "Barbell Front Squat",
      "front squat"
    ],
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-036-barbell-front-squat"
    }
  },
  {
    "catalogNumber": "EX-037",
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
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-037-leg-press"
    }
  },
  {
    "catalogNumber": "EX-038",
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
    "secondaryMuscles": [],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-038-leg-extension"
    }
  },
  {
    "catalogNumber": "EX-039",
    "id": "dumbbell-lunge" as ExerciseId,
    "content": {
      "ru": {
        "name": "Выпады с гантелями",
        "instructions": [
          "Встаньте ровно, удерживая гантели по бокам.",
          "Сделайте шаг вперёд и согните обе ноги до комфортной глубины.",
          "Сохраните опору передней стопой и устойчивое положение корпуса.",
          "Оттолкнитесь передней ногой, вернитесь в стойку и смените сторону."
        ]
      }
    },
    "aliases": [
      "Dumbbell Lunge",
      "forward lunge"
    ],
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-039-dumbbell-lunge"
    }
  },
  {
    "catalogNumber": "EX-040",
    "id": "bulgarian-split-squat" as ExerciseId,
    "content": {
      "ru": {
        "name": "Болгарские сплит-приседания",
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
      "болгарские выпады",
      "Болгарские сплит-приседания с гантелями"
    ],
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": [
      "dumbbells",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-040-bulgarian-split-squat"
    }
  },
  {
    "catalogNumber": "EX-041",
    "id": "goblet-squat" as ExerciseId,
    "content": {
      "ru": {
        "name": "Goblet-приседания",
        "instructions": [
          "Возьмите одну гантель или гирю и удерживайте её у груди.",
          "Поставьте стопы в удобную устойчивую позицию.",
          "Присядьте, направляя колени по линии стоп и сохраняя ровный корпус.",
          "Поднимитесь с опорой всей стопой, удерживая вес близко к телу."
        ]
      }
    },
    "aliases": [
      "Goblet Squat",
      "кубковые приседания"
    ],
    "primaryMuscles": [
      "quadriceps"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "equipment": [
      "dumbbellOrKettlebell"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-041-goblet-squat"
    }
  },
  {
    "catalogNumber": "EX-042",
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
      "RDL",
      "rdl"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "glutes",
      "lowerBack"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-042-romanian-deadlift"
    }
  },
  {
    "catalogNumber": "EX-043",
    "id": "leg-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сгибание ног лёжа",
        "instructions": [
          "Лягте на тренажёр и настройте валик над пятками, совместив колени с осью вращения.",
          "Возьмитесь за рукояти и сохраните таз на опоре.",
          "Согните колени, подтягивая валик к ягодицам.",
          "Плавно разогните ноги, не поднимая таз."
        ]
      }
    },
    "aliases": [
      "Lying Leg Curl",
      "prone leg curl",
      "Leg Curl",
      "Сгибание ног в тренажёре"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-043-leg-curl"
    }
  },
  {
    "catalogNumber": "EX-044",
    "id": "seated-leg-curl" as ExerciseId,
    "content": {
      "ru": {
        "name": "Сгибание ног сидя",
        "instructions": [
          "Настройте сиденье, совместите колени с осью тренажёра и закрепите бедра подушкой.",
          "Расположите голени на валике и возьмитесь за рукояти.",
          "Согните колени, направляя валик вниз и назад.",
          "Плавно верните ноги вперёд, сохраняя корпус на спинке."
        ]
      }
    },
    "aliases": [
      "Seated Leg Curl"
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-044-seated-leg-curl"
    }
  },
  {
    "catalogNumber": "EX-045",
    "id": "conventional-deadlift" as ExerciseId,
    "content": {
      "ru": {
        "name": "Становая тяга",
        "instructions": [
          "Подойдите к штанге так, чтобы гриф находился над серединой стоп.",
          "Отведите таз назад, согните колени и возьмитесь за гриф снаружи ног.",
          "Создайте устойчивое положение корпуса и поднимитесь, удерживая гриф близко к ногам.",
          "Верните штангу на пол, отводя таз назад и затем сгибая колени."
        ],
        "tips": [
          "Не отклоняйтесь назад в верхней точке; завершайте подъём стоя ровно."
        ]
      }
    },
    "aliases": [
      "Conventional Deadlift",
      "deadlift"
    ],
    "primaryMuscles": [
      "posteriorChain"
    ],
    "secondaryMuscles": [
      "back",
      "glutes",
      "hamstrings"
    ],
    "equipment": [
      "barbell"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-045-conventional-deadlift"
    }
  },
  {
    "catalogNumber": "EX-046",
    "id": "barbell-hip-thrust" as ExerciseId,
    "content": {
      "ru": {
        "name": "Hip Thrust со штангой",
        "instructions": [
          "Обопритесь верхней частью спины на устойчивую скамью и расположите штангу на сгибе таза с мягкой накладкой.",
          "Поставьте стопы так, чтобы в верхней точке голени были примерно вертикальны.",
          "Поднимите таз до линии корпуса и бёдер, сохраняя рёбра собранными.",
          "Подконтрольно опустите таз, удерживая стопы на месте."
        ]
      }
    },
    "aliases": [
      "Barbell Hip Thrust",
      "hip thrust",
      "ягодичный мост со штангой"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-046-barbell-hip-thrust"
    }
  },
  {
    "catalogNumber": "EX-047",
    "id": "glute-bridge" as ExerciseId,
    "content": {
      "ru": {
        "name": "Ягодичный мост",
        "instructions": [
          "Лягте на спину, согните колени и поставьте стопы на пол.",
          "Удерживайте руки вдоль тела и сохраняйте опору плечами.",
          "Поднимите таз до линии корпуса и бёдер без переразгибания поясницы.",
          "Плавно опустите таз и повторите движение."
        ]
      }
    },
    "aliases": [
      "Glute Bridge"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-047-glute-bridge"
    }
  },
  {
    "catalogNumber": "EX-048",
    "id": "cable-glute-kickback" as ExerciseId,
    "content": {
      "ru": {
        "name": "Отведение ноги назад в кроссовере",
        "instructions": [
          "Закрепите манжету нижнего блока на голени и встаньте лицом к тренажёру.",
          "Возьмитесь за опору и слегка согните опорную ногу.",
          "Отведите рабочую ногу назад, сохраняя таз направленным вперёд.",
          "Плавно верните ногу и после подхода смените сторону."
        ]
      }
    },
    "aliases": [
      "Cable Glute Kickback",
      "cable kickback"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-048-cable-glute-kickback"
    }
  },
  {
    "catalogNumber": "EX-049",
    "id": "hip-abduction-machine" as ExerciseId,
    "content": {
      "ru": {
        "name": "Отведение ног в тренажёре",
        "instructions": [
          "Сядьте на тренажёр, настройте опоры снаружи бёдер и выберите комфортную амплитуду.",
          "Обопритесь на спинку и возьмитесь за рукояти.",
          "Разведите бёдра в стороны, сохраняя таз на сиденье.",
          "Подконтрольно сведите ноги без удара весов."
        ]
      }
    },
    "aliases": [
      "Hip Abduction Machine",
      "hip abduction"
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-049-hip-abduction-machine"
    }
  },
  {
    "catalogNumber": "EX-050",
    "id": "standing-calf-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём на носки стоя",
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
      "Standing Calf Raise",
      "Подъём на носки стоя в тренажёре"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-050-standing-calf-raise"
    }
  },
  {
    "catalogNumber": "EX-051",
    "id": "seated-calf-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём на носки сидя",
        "instructions": [
          "Сядьте в тренажёр, положите подушки над коленями и поставьте носки на платформу.",
          "Освободите фиксатор и плавно опустите пятки.",
          "Поднимите пятки, сохраняя стопы устойчивыми на платформе.",
          "Медленно вернитесь вниз без пружинящих движений."
        ]
      }
    },
    "aliases": [
      "Seated Calf Raise"
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "machine"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-051-seated-calf-raise"
    }
  },
  {
    "catalogNumber": "EX-052",
    "id": "crunch" as ExerciseId,
    "content": {
      "ru": {
        "name": "Скручивания",
        "instructions": [
          "Лягте на спину, согните колени и поставьте стопы на пол.",
          "Скрестите руки на груди или расположите у висков без давления на голову.",
          "Поднимите лопатки, сближая рёбра с тазом.",
          "Подконтрольно опустите верхнюю часть спины."
        ]
      }
    },
    "aliases": [
      "Crunch",
      "abdominal crunch"
    ],
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-052-crunch"
    }
  },
  {
    "catalogNumber": "EX-053",
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
    "secondaryMuscles": [
      "hipFlexors"
    ],
    "equipment": [
      "pullUpBar"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-053-hanging-leg-raise"
    }
  },
  {
    "catalogNumber": "EX-054",
    "id": "hanging-knee-raise" as ExerciseId,
    "content": {
      "ru": {
        "name": "Подъём коленей в висе",
        "instructions": [
          "Повисните на турнике удобным хватом и стабилизируйте плечи.",
          "Согните колени и поднимите их к корпусу.",
          "Слегка подкрутите таз в верхней точке без раскачивания.",
          "Плавно опустите ноги и восстановите неподвижный вис."
        ]
      }
    },
    "aliases": [
      "Hanging Knee Raise"
    ],
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [
      "hipFlexors"
    ],
    "equipment": [
      "pullUpBar"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-054-hanging-knee-raise"
    }
  },
  {
    "catalogNumber": "EX-055",
    "id": "plank" as ExerciseId,
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
      "Plank",
      "front plank"
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "glutes",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "duration",
    "media": {
      "illustrationAssetKey": "EX-055-plank"
    }
  },
  {
    "catalogNumber": "EX-056",
    "id": "side-plank" as ExerciseId,
    "content": {
      "ru": {
        "name": "Боковая планка",
        "instructions": [
          "Лягте на бок и разместите локоть под плечом.",
          "Выпрямите ноги и поднимите таз с опорой на предплечье и стопы.",
          "Сохраняйте линию головы, корпуса и ног, продолжая дышать.",
          "Завершите удержание подконтрольно и смените сторону."
        ]
      }
    },
    "aliases": [
      "Side Plank"
    ],
    "primaryMuscles": [
      "obliques"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "duration",
    "media": {
      "illustrationAssetKey": "EX-056-side-plank"
    }
  },
  {
    "catalogNumber": "EX-057",
    "id": "cable-crunch" as ExerciseId,
    "content": {
      "ru": {
        "name": "Скручивания на верхнем блоке",
        "instructions": [
          "Возьмите канат верхнего блока и встаньте на колени лицом к тренажёру.",
          "Удерживайте рукоять около головы, не тяните её руками.",
          "Скрутите корпус, приближая рёбра к тазу.",
          "Плавно разверните корпус обратно, сохраняя положение таза."
        ]
      }
    },
    "aliases": [
      "Cable Crunch",
      "kneeling cable crunch",
      "Скручивания на блоке"
    ],
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [],
    "equipment": [
      "cable"
    ],
    "trackingType": "weightReps",
    "media": {
      "illustrationAssetKey": "EX-057-cable-crunch"
    }
  },
  {
    "catalogNumber": "EX-058",
    "id": "russian-twist" as ExerciseId,
    "content": {
      "ru": {
        "name": "Русские скручивания",
        "instructions": [
          "Сядьте на пол, согните колени и оставьте стопы на опоре.",
          "Слегка отклоните устойчивый корпус назад и сложите руки перед грудью.",
          "Плавно поверните грудную клетку в одну сторону, затем в другую.",
          "Сохраняйте контроль корпуса без резких рывков."
        ]
      }
    },
    "aliases": [
      "Russian Twist"
    ],
    "primaryMuscles": [
      "obliques"
    ],
    "secondaryMuscles": [
      "abs"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-058-russian-twist"
    }
  },
  {
    "catalogNumber": "EX-059",
    "id": "farmers-walk" as ExerciseId,
    "content": {
      "ru": {
        "name": "Фермерская прогулка",
        "instructions": [
          "Поднимите две гантели и встаньте ровно, удерживая их по бокам.",
          "Стабилизируйте корпус и оставьте плечи в естественном положении.",
          "Идите короткими уверенными шагами, не наклоняясь в стороны.",
          "Остановитесь и опустите гантели подконтрольно."
        ],
        "tips": [
          "Сохраняйте свободное дыхание и выбирайте путь без препятствий."
        ]
      }
    },
    "aliases": [
      "Farmers Walk",
      "farmer carry",
      "farmer's walk"
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "traps",
      "forearms"
    ],
    "equipment": [
      "dumbbells"
    ],
    "trackingType": "duration",
    "media": {
      "illustrationAssetKey": "EX-059-farmers-walk"
    },
    "additionalGroups": [
      "fullBody"
    ]
  },
  {
    "catalogNumber": "EX-060",
    "id": "burpee" as ExerciseId,
    "content": {
      "ru": {
        "name": "Берпи",
        "instructions": [
          "Встаньте устойчиво и опустите ладони на пол перед стопами.",
          "Переведите ноги назад в упор, сохраняя устойчивый корпус.",
          "Верните стопы к ладоням и поднимитесь.",
          "Выполните небольшой контролируемый прыжок и мягко приземлитесь."
        ],
        "tips": [
          "Сначала освойте переходы шагом; прыжок не должен нарушать устойчивость."
        ]
      }
    },
    "aliases": [
      "Burpee"
    ],
    "primaryMuscles": [
      "fullBody"
    ],
    "secondaryMuscles": [
      "legs",
      "chest",
      "shoulders",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "trackingType": "reps",
    "media": {
      "illustrationAssetKey": "EX-060-burpee"
    }
  }
];
