<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import backButton from "../../../assets/back-button.svg";
import NextButton from "../../../assets/next.svg";
import NextButtonDisabled from "../../../assets/next_disabled.svg";
import PrevButton from "../../../assets/prev.svg";
import PrevButtonDisabled from "../../../assets/prev_disabled.svg";
import { useUser } from "../../contexts/UserContext";
import { get, post } from "../../utilities";

interface ClothingInput {
  userId: string;
  image: string;
  name: string;
  type: string;
  color: string;
  max_wears: number | null;
  current_wears: number;
  min_temp: number | null;
  max_temp: number | null;
  times_rejected: number;
}

interface RouteParams {
  clothingIds: string;
  clothingType: string;
  newArticle: string;
}

const router = useRouter();
const route = useRoute();
const { user, setUser } = useUser();

const clothingParams = route.params as RouteParams;
const clothingIds = ref(clothingParams.clothingIds.split(","));
let clothingType = clothingParams.clothingType;
if (clothingType === "welcome") {
  clothingType = "top";
}
const newArticle = clothingParams.newArticle;
const index = ref(0);
const imperial = ref(true);
const changed = ref(false);

const defaultClothingInput: ClothingInput = {
  userId: "",
  image: "",
  name: "",
  type: clothingType,
  color: "",
  max_wears: null,
  current_wears: 0,
  min_temp: null,
  max_temp: null,
  times_rejected: 0,
};

const clothingInput: Ref<ClothingInput> = ref({ ...defaultClothingInput });

const loadClothingArticle = async () => {
  if (clothingIds.value.length === 0 || index.value >= clothingIds.value.length) {
    clothingInput.value = { ...defaultClothingInput };
    return;
  }

  const currentId = clothingIds.value[index.value];

  try {
    const response = await get<ClothingInput>(`/api/clothingarticle/${currentId}`);
    clothingInput.value = response;

    if (clothingInput.value.name === "") {
      document.getElementById("title")?.focus();
    }
  } catch (error) {
    console.error("Error fetching clothing article:", error);
  }
};

onMounted(() => {
  if (user && user[0].tempSetting === "imperial") {
    imperial.value = true;
  } else if (user && user[0].tempSetting === "metric") {
    imperial.value = false;
  }

  loadClothingArticle();
});

watch([route.params, index], () => {
  if (clothingIds.value.length === 0 && newArticle === "true") {
    router.push(`/new/${clothingParams.clothingType}`);
  } else if (clothingIds.value.length === 0) {
    router.push(`/closet/${clothingParams.clothingType}`);
  }
  index.value = Math.min(index.value, clothingIds.value.length - 1);
  loadClothingArticle();
});

const handleChange = (e: Event) => {
  changed.value = true;
  const target = e.target as HTMLInputElement;
  const { name, value } = target;
  if (value !== "null") {
    let newValue = parseFloat(value);

    if (!imperial.value && (name === "min_temp" || name === "max_temp") && value) {
      newValue = (newValue * 9) / 5 + 32;
    }

    clothingInput.value = {
      ...clothingInput.value,
      [name]: newValue,
    };
  }
};

const handlePrevArticle = () => {
  saveEdits();
  index.value -= 1;
};

const extractEditableProperties = (clothingArticle: ClothingInput) => {
  const { userId, image, name, type, color, max_wears, min_temp, max_temp, current_wears, times_rejected } = clothingArticle;

  return {
    userId,
    image,
    name,
    type,
    color,
    max_wears,
    current_wears,
    min_temp,
    max_temp,
    times_rejected,
  };
};

const saveEdits = async () => {
  try {
    const currentId = clothingIds.value[index.value];
    const editedProperties = extractEditableProperties(clothingInput.value);

    await post(`/api/clothingarticle/${currentId}`, {
      editedProperties,
    });
  } catch (error) {
    console.log("trouble saving edits");
  }
};

const handleNextArticle = () => {
  saveEdits();
  index.value += 1;
};

const handleSubmit = () => {
  saveEdits();
  if (clothingParams.clothingType === "welcome") {
    router.push(`/home`);
  } else {
    router.push(`/closet/${clothingType}`);
  }
};

const handleBack = () => {
  if (newArticle === "false" && !changed.value) {
    router.push(`/closet/${clothingType}`);
  } else {
    const userConfirmed = window.confirm("Are you sure you want to return? Your edits will not be saved.");
    if (!userConfirmed) {
      return;
    }
    if (clothingIds.value.length > 1 || newArticle === "true") {
      post(`/api/del/${clothingIds.value.join(",")}`);
    }
    if (clothingParams.clothingType === "welcome") {
      router.push(`/new/welcome`);
    } else {
      router.push(`/closet/${clothingType}`);
    }
  }
};

const handleDelete = () => {
  const userConfirmed = window.confirm("Are you sure you want to delete this item? This action cannot be undone.");
  if (!userConfirmed) {
    return;
  }
  post(`/api/del/${clothingIds.value[index.value]}`);

  const updatedClothingIds = [...clothingIds.value];
  updatedClothingIds.splice(index.value, 1);
  clothingIds.value = updatedClothingIds;
};

export {
  backButton,
  clothingIds,
  clothingInput,
  handleBack,
  handleChange,
  handleDelete,
  handleNextArticle,
  handlePrevArticle,
  handleSubmit,
  imperial,
  index,
  NextButton,
  NextButtonDisabled,
  PrevButton,
  PrevButtonDisabled,
};
</script>
