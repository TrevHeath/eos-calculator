import * as React from "react"
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
} from "@chakra-ui/react"

import { Controller, useForm } from "react-hook-form"

import Layout from "../components/layout"
import Seo from "../components/seo"

function sumBetas({
  incidence,
  tempimp,
  ga4mdlng,
  ga4mdlng_sq,
  romimp,
  approptx1,
  approptx2,
  j_gbscar1,
  j_gbscar2,
}) {
  const tempimpVar = 0.868 * tempimp
  console.log("tempimp:", tempimpVar)

  const ga4mdlngVar = -6.9325 * ga4mdlng
  console.log("ga4mdlng:", ga4mdlngVar)

  const ga4mdlng_sqVar = 0.0877 * ga4mdlng_sq
  console.log("ga4mdlng_sq:", ga4mdlng_sqVar)

  const romimpVar = 1.2256 * (romimp + 0.05) ** 0.2
  console.log("romimp:", romimpVar)

  const approptx1Var = -1.0488 * approptx1
  console.log("approptx1:", approptx1Var)

  const approptx2Var = -1.1861 * approptx2
  console.log("approptx2:", approptx2Var)

  const j_gbscar1Var = 0.5771 * j_gbscar1
  console.log("j_gbscar1:", j_gbscar1Var)

  const j_gbscar2Var = 0.0427 * j_gbscar2
  console.log("j_gbscar2:", j_gbscar2Var)

  const sum =
    incidence +
    tempimpVar +
    ga4mdlngVar +
    ga4mdlng_sqVar +
    romimpVar +
    approptx1Var +
    approptx2Var +
    j_gbscar1Var +
    j_gbscar2Var

  return sum
}

function calculateAlertInfo(value, eosAtBirth, isClinicalIllness) {
  if (isClinicalIllness && eosAtBirth < 3 && value < 3) {
    return {
      color: "red",
      messageOne: "Empiric antibiotics",
      messageTwo: "Vitals per NICU",
    }
  }

  if (value < 1) {
    return eosAtBirth >= 1
      ? {
          color: "yellow",
          messageOne: "No culture + no antibiotics",
          messageTwo: "Vitals every 4 hours for 24 hours",
        }
      : {
          color: "green",
          messageOne: "No culture + no antibiotics",
          messageTwo: "Routine Vitals",
        }
  } else if (value < 3) {
    return {
      color: "yellow",
      messageOne: "Blood Culture",
      messageTwo: "Vitals every 4 hours for 24 hours",
    }
  } else {
    return {
      color: "red",
      messageOne: "Empiric antibiotics",
      messageTwo: "Vitals per NICU",
    }
  }
}

function calculateEOS(betas) {
  const sumOfBetas = sumBetas(betas)

  const eosAtBirth = 1 / (1 + Math.exp(-sumOfBetas))

  const eosPer1000 = eosAtBirth / (1 - eosAtBirth)
  const wellAppearing = 0.41 * eosPer1000
  const equivocal = 5 * eosPer1000
  const clinicalIllness = 21.2 * eosPer1000

  return {
    "EOS At Birth": { value: eosAtBirth, hide: true },
    "EOS Per 1000": { value: eosPer1000 * 1000 },
    "Well Appearing": {
      value: wellAppearing * 1000,
      ...calculateAlertInfo(wellAppearing * 1000, eosAtBirth),
    },
    Equivocal: {
      value: equivocal * 1000,
      ...calculateAlertInfo(equivocal * 1000, eosAtBirth),
    },
    "Clinical Illness": {
      value: clinicalIllness * 1000,
      ...calculateAlertInfo(clinicalIllness * 1000, eosAtBirth, true),
    },
  }
}

const SecondPage = () => {
  const [results, setResults] = React.useState()
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  })

  const onSubmit = d => {
    const ga4mdlng = parseFloat(d.gaWeeks) + parseFloat(d.gaDays) / 7

    const res = calculateEOS({
      incidence: parseFloat(d.incidence),
      tempimp: parseFloat(d.tempimp),
      romimp: parseFloat(d.romimp),
      ga4mdlng: parseFloat(ga4mdlng), // convert to weeks
      ga4mdlng_sq: parseFloat(ga4mdlng) * parseFloat(ga4mdlng), // convert to weeks and square it
      approptx1: d.approptx.includes("approptx1") ? 1 : 0, // convert to 0 or 1
      approptx2: d.approptx.includes("approptx2") ? 1 : 0, // convert to 0 or 1
      j_gbscar1: d.j_gbscar.includes("j_gbscar1") ? 1 : 0, // convert to 0 or 1
      j_gbscar2: d.j_gbscar.includes("j_gbscar2") ? 1 : 0, // convert to 0 or 1
    })
    setResults(res)
  }

  return (
    <Layout>
      <Heading as={"h3"} sx={{ mb: "10px" }}>
        Probability of Neonatal Early-Onset Sepsis Based on Maternal Risk
        Factors and the Infant's Clinical Presentation
      </Heading>
      <p sx={{ mb: "20px" }}>
        The tool below is intended for the use of clinicians trained and
        experienced in the care of newborn infants. Using this tool, the risk of
        early-onset sepsis can be calculated in an infant born {">"} 34 weeks
        gestation. The interactive calculator produces the probability of early
        onset sepsis per 1000 babies by entering values for the specified
        maternal risk factors along with the infant's clinical presentation.
      </p>

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormControl isInvalid={errors.incidence}>
          <FormLabel htmlFor="incidence">
            Incidence of Early-Onset Sepsis
          </FormLabel>
          <Select {...register("incidence", { required: "Required" })}>
            <option aria-label="0" value="0"></option>
            <option aria-label="38.952265" value="38.952265">
              0.1/1000 live births
            </option>
            <option aria-label="39.646367" value="39.646367">
              0.2/1000 live births
            </option>
            <option aria-label="40.05280" value="40.05280">
              0.3/1000 live births (KPNC incidence)
            </option>
            <option aria-label="40.34150" value="40.34150">
              0.4/1000 live births
            </option>
            <option aria-label="40.56560" value="40.56560">
              0.5/1000 live births (CDC national incidence)
            </option>
            <option aria-label="40.74890" value="40.74890">
              0.6/1000 live births
            </option>
            <option aria-label="40.903919" value="40.903919">
              0.7/1000 live births
            </option>
            <option aria-label="41.0384" value="41.0384">
              0.8/1000 live births
            </option>
            <option aria-label="41.1571" value="41.1571">
              0.9/1000 live births
            </option>
            <option aria-label="41.263432" value="41.263432">
              1/1000 live births
            </option>
            <option aria-label="41.965852" value="41.965852">
              2/1000 live births
            </option>
            <option aria-label="42.676976" value="42.676976">
              4/1000 live births
            </option>
          </Select>
          <FormErrorMessage>
            {errors.incidence && errors.incidence.message}
          </FormErrorMessage>
        </FormControl>

        <Flex sx={{ gap: "10px", flexWrap: "wrap" }}>
          <FormControl isInvalid={errors.gaWeeks} sx={{ flex: 1 }}>
            <FormLabel htmlFor="gaWeeks">Gestational Age (weeks)</FormLabel>
            <Input
              type="number"
              placeholder="30-43"
              {...register("gaWeeks", {
                required: "Required",
                max: {
                  value: 43,
                  message: "Please enter a value between 34 to 43 only.",
                },
                min: {
                  value: 30,
                  message: "Please enter a value between 34 to 43 only.",
                },
              })}
            />{" "}
            <FormErrorMessage>
              {errors.gaWeeks && errors.gaWeeks.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.gaDays} sx={{ flex: 1 }}>
            <FormLabel htmlFor="gaDays">Gestational Age (days)</FormLabel>
            <Input
              placeholder="0-6"
              type="number"
              {...register("gaDays", {
                required: "Required",
                max: {
                  value: 6,
                  message: "Please enter a value between 0 to 6 only.",
                },
                min: {
                  value: 0,
                  message: "Please enter a value between 0 to 6 only.",
                },
              })}
            />{" "}
            <FormErrorMessage>
              {errors.gaWeeks && errors.gaWeeks.message}
            </FormErrorMessage>
          </FormControl>
        </Flex>
        <FormControl isInvalid={errors.tempimp}>
          <FormLabel htmlFor="tempimp">
            Highest maternal antepartum temperature
          </FormLabel>
          <Input
            type="number"
            step="0.01"
            {...register("tempimp", { required: "Required" })}
          />{" "}
          <FormErrorMessage>
            {errors.tempimp && errors.tempimp.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors.romimp}>
          <FormLabel htmlFor="gaDays">ROM (hrs)</FormLabel>
          <Input
            type="number"
            {...register("romimp", {
              required: "Required",
              max: {
                value: 240,
                message: "Please enter a value between 0 to 240.",
              },
              min: {
                value: 0,
                message: "Please enter a value between 0 to 240.",
              },
            })}
          />{" "}
          <FormErrorMessage>
            {errors.romimp && errors.romimp.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl id="j_gbscar" isInvalid={errors.j_gbscar}>
          <FormLabel>Maternal GBS status</FormLabel>
          <Controller
            name="j_gbscar"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="column">
                  <Radio value="0">Negative</Radio>
                  <Radio value="j_gbscar1">Positive</Radio>
                  <Radio value="j_gbscar2">Unknown</Radio>
                </Stack>
              </RadioGroup>
            )}
            rules={{
              required: { value: true, message: "This is required." },
            }}
          />
          <FormErrorMessage>{errors.j_gbscar?.message}</FormErrorMessage>
        </FormControl>

        <FormControl id="approptx" isInvalid={errors.approptx}>
          <FormLabel>Type of intrapartum antibiotics</FormLabel>
          <Controller
            name="approptx"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="column">
                  <Radio value="approptx2">
                    Broad spectrum antibiotics {">"} 4 hrs prior to birth
                  </Radio>{" "}
                  <Radio value="approptx1:a">
                    Broad spectrum antibiotics 2-3.9 hrs prior to birth
                  </Radio>{" "}
                  <Radio value="approptx1:b">
                    GBS specific antibiotics {">"} 2 hrs prior to birth
                  </Radio>
                  <Radio value="0">
                    No antibiotics or any antibiotics {"<"} 2 hrs prior to birth
                  </Radio>
                </Stack>
              </RadioGroup>
            )}
            rules={{
              required: { value: true, message: "This is required." },
            }}
          />
          <FormErrorMessage>{errors.approptx?.message}</FormErrorMessage>
        </FormControl>

        <Flex sx={{ gap: "10px", mt: "30px" }}>
          <Button colorScheme="teal" type="submit">
            Calculate
          </Button>
          <Button
            colorScheme="gray"
            type="button"
            onClick={() => {
              reset()
              setResults()
            }}
          >
            Clear
          </Button>
        </Flex>
      </form>
      <Box sx={{ my: "20px" }}>
        {results &&
          Object.entries(results).map(([key, item]) =>
            item.hide ? (
              <React.Fragment />
            ) : (
              <Flex
                style={{
                  border: `5px solid ${item.color || "black"}`,
                  padding: "20px",
                  fontWeight: "bold",
                  marginTop: "10px",
                  justifyContent: "flex-start",
                }}
              >
                <Box sx={{ flex: 1, textAlign: "left" }}> {key}:</Box>
                <Box sx={{ flex: 0.5, textAlign: "left" }}>
                  {item.value.toFixed(2)}
                </Box>{" "}
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  {" "}
                  {item.messageOne}
                </Box>
                <Box sx={{ flex: 1, textAlign: "center" }}>
                  {" "}
                  {item.messageTwo}
                </Box>
              </Flex>
            )
          )}
      </Box>
    </Layout>
  )
}

export const Head = () => <Seo title="Calculator" />

export default SecondPage
