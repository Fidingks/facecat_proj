import replicate

input = {
    "prompt": "black forest gateau cake spelling out the words \"FLUX SCHNELL\", tasty, food photography, dynamic shot"
}

output = replicate.run(
    "black-forest-labs/flux-schnell",
    input=input
)
for index, item in enumerate(output):
    with open(f"output_{index}.webp", "wb") as file:
        file.write(item.read())
#=> output_0.webp written to disk